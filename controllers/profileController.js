import pool from '../utils/db.js';

// Get profile info
export const getProfile = async (req, res) => {
  const userId = req.user.id;
  if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

  try {
    const user = await pool.query(
      'SELECT id, fst_nme, lst_nme, eml, usr_nme, height_cm, target_weight_kg, cre_dat, cre_by, upd_dat, upd_by FROM bp.t_usr WHERE id = $1',
      [userId]
    );
    if (user.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, profile: user.rows[0] });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// Update profile info
export const updateProfile = async (req, res) => {
  const userId = req.user.id;
  if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

  const { firstName, lastName, email } = req.body;
  const upd_by = `${firstName} ${lastName}`;

  try {
    const result = await pool.query(
      `UPDATE bp.t_usr
       SET fst_nme = $1, lst_nme = $2, eml = $3, upd_dat = NOW(), upd_by = $4
       WHERE id = $5
       RETURNING id, fst_nme, lst_nme, eml, usr_nme, height_cm, cre_dat, cre_by, upd_dat, upd_by`,
      [firstName, lastName, email, upd_by, userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, profile: result.rows[0], message: 'Profile updated' });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// Update height only
export const updateHeight = async (req, res) => {
  const userId = req.user.id;
  if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

  const { heightCm } = req.body;
  const h = parseFloat(heightCm);
  if (!Number.isFinite(h) || h < 50 || h > 300) {
    return res.status(400).json({ success: false, message: 'Невалиден ръст (50–300 см)' });
  }

  try {
    const result = await pool.query(
      'UPDATE bp.t_usr SET height_cm = $1, upd_dat = NOW() WHERE id = $2 RETURNING id, height_cm',
      [h, userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, height_cm: result.rows[0].height_cm });
  } catch (error) {
    console.error('Update height error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// Update target weight
export const updateTargetWeight = async (req, res) => {
  const userId = req.user.id;
  if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

  const { targetWeightKg } = req.body;
  const w = parseFloat(targetWeightKg);
  if (!Number.isFinite(w) || w < 20 || w > 300) {
    return res.status(400).json({ success: false, message: 'Невалидно целево тегло (20–300 кг)' });
  }

  try {
    const result = await pool.query(
      'UPDATE bp.t_usr SET target_weight_kg = $1, upd_dat = NOW() WHERE id = $2 RETURNING id, target_weight_kg',
      [w, userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, target_weight_kg: result.rows[0].target_weight_kg });
  } catch (error) {
    console.error('Update target weight error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// Get body weight log
export const getBodyLog = async (req, res) => {
  const userId = req.user.id;
  if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

  try {
    const result = await pool.query(
      `SELECT id, weight_kg, log_date, note, cre_dat
       FROM bp.t_body_log
       WHERE usr_id = $1
       ORDER BY log_date DESC`,
      [userId]
    );
    res.json({ success: true, entries: result.rows });
  } catch (error) {
    console.error('Get body log error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// Add body weight entry (upsert by date)
export const addBodyLog = async (req, res) => {
  const userId = req.user.id;
  if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

  const { weight_kg, log_date, note } = req.body;
  const w = parseFloat(weight_kg);
  if (!Number.isFinite(w) || w <= 0) {
    return res.status(400).json({ success: false, message: 'Невалидно тегло' });
  }
  const date = log_date || new Date().toISOString().slice(0, 10);

  try {
    const result = await pool.query(
      `INSERT INTO bp.t_body_log (usr_id, weight_kg, log_date, note)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (usr_id, log_date) DO UPDATE
         SET weight_kg = EXCLUDED.weight_kg, note = EXCLUDED.note, cre_dat = now()
       RETURNING id, weight_kg, log_date, note, cre_dat`,
      [userId, w, date, note || null]
    );
    res.status(201).json({ success: true, entry: result.rows[0] });
  } catch (error) {
    console.error('Add body log error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// Delete body weight entry
export const deleteBodyLog = async (req, res) => {
  const userId = req.user.id;
  if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

  const { id } = req.params;
  try {
    const result = await pool.query(
      'DELETE FROM bp.t_body_log WHERE id = $1 AND usr_id = $2 RETURNING id',
      [id, userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Entry not found' });
    }
    res.json({ success: true, message: 'Entry deleted' });
  } catch (error) {
    console.error('Delete body log error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};