import pool from '../utils/db.js';

// Get all supplements for the current user
export const getSupplements = async (req, res) => {
  const userId = req.user.id;
  try {
    const result = await pool.query(
      `SELECT id, name, dosage, notes, created_at
       FROM bp.supplements
       WHERE user_id = $1
       ORDER BY created_at`,
      [userId]
    );
    res.json({ success: true, supplements: result.rows });
  } catch (error) {
    console.error('Get supplements error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// Add a new supplement
export const addSupplement = async (req, res) => {
  const userId = req.user.id;
  const { name, dosage, notes } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ success: false, message: 'name is required' });
  }
  try {
    const result = await pool.query(
      `INSERT INTO bp.supplements (user_id, name, dosage, notes)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, dosage, notes, created_at`,
      [userId, name.trim(), dosage?.trim() || null, notes?.trim() || null]
    );
    res.status(201).json({ success: true, supplement: result.rows[0] });
  } catch (error) {
    console.error('Add supplement error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// Update a supplement
export const updateSupplement = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  const { name, dosage, notes } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ success: false, message: 'name is required' });
  }
  try {
    const result = await pool.query(
      `UPDATE bp.supplements
       SET name = $1, dosage = $2, notes = $3
       WHERE id = $4 AND user_id = $5
       RETURNING id, name, dosage, notes, created_at`,
      [name.trim(), dosage?.trim() || null, notes?.trim() || null, id, userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Supplement not found' });
    }
    res.json({ success: true, supplement: result.rows[0] });
  } catch (error) {
    console.error('Update supplement error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// Delete a supplement
export const deleteSupplement = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  try {
    const result = await pool.query(
      'DELETE FROM bp.supplements WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Supplement not found' });
    }
    res.json({ success: true, message: 'Supplement deleted' });
  } catch (error) {
    console.error('Delete supplement error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// Get supplement log for a specific date (all user supplements with taken status)
export const getSupplementLog = async (req, res) => {
  const userId = req.user.id;
  const { date } = req.query;
  if (!date) {
    return res.status(400).json({ success: false, message: 'date is required (YYYY-MM-DD)' });
  }
  try {
    const result = await pool.query(
      `SELECT s.id, s.name, s.dosage, s.notes,
              COALESCE(sl.taken, false) AS taken,
              sl.id AS log_id
       FROM bp.supplements s
       LEFT JOIN bp.supplement_log sl
         ON sl.supplement_id = s.id AND sl.log_date = $2 AND sl.user_id = $1
       WHERE s.user_id = $1
       ORDER BY s.created_at`,
      [userId, date]
    );
    res.json({ success: true, log: result.rows });
  } catch (error) {
    console.error('Get supplement log error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// Toggle taken status for a supplement on a date
export const toggleSupplementTaken = async (req, res) => {
  const userId = req.user.id;
  const { supplement_id, log_date, taken } = req.body;
  if (!supplement_id || !log_date) {
    return res.status(400).json({ success: false, message: 'supplement_id and log_date are required' });
  }
  try {
    // Verify supplement belongs to user
    const check = await pool.query(
      'SELECT id FROM bp.supplements WHERE id = $1 AND user_id = $2',
      [supplement_id, userId]
    );
    if (check.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Supplement not found' });
    }

    const result = await pool.query(
      `INSERT INTO bp.supplement_log (user_id, supplement_id, log_date, taken)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, supplement_id, log_date)
       DO UPDATE SET taken = EXCLUDED.taken
       RETURNING id, supplement_id, log_date, taken`,
      [userId, supplement_id, log_date, taken ?? true]
    );
    res.json({ success: true, entry: result.rows[0] });
  } catch (error) {
    console.error('Toggle supplement taken error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};
