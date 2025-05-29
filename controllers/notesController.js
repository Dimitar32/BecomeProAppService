import pool from '../utils/db.js';

// Add a note
export const addNote = async (req, res) => {
  const userId = req.user.id;
  const { nte_dat, nte_txt } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO nte.t_nte (usr_id, nte_dat, nte_txt)
       VALUES ($1, $2, $3)
       ON CONFLICT (usr_id, nte_dat)
       DO UPDATE SET nte_txt = EXCLUDED.nte_txt, upd_dat = NOW()
       RETURNING id, usr_id, nte_dat, nte_txt, cre_dat, upd_dat`,
      [userId, nte_dat, nte_txt]
    );
    res.status(201).json({ success: true, note: result.rows[0] });
  } catch (error) {
    console.error('Add note error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// Delete a note
export const deleteNote = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  try {
    const result = await pool.query(
      'DELETE FROM nte.t_nte WHERE id = $1 AND usr_id = $2 RETURNING id',
      [id, userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }
    res.json({ success: true, message: 'Note deleted' });
  } catch (error) {
    console.error('Delete note error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// Update a note
export const updateNote = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  const { nte_txt } = req.body;

  try {
    const result = await pool.query(
      `UPDATE nte.t_nte
       SET nte_txt = $1, upd_dat = NOW()
       WHERE id = $2 AND usr_id = $3
       RETURNING id, usr_id, nte_dat, nte_txt, cre_dat, upd_dat`,
      [nte_txt, id, userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }
    res.json({ success: true, note: result.rows[0] });
  } catch (error) {
    console.error('Update note error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// Get all notes by user
export const getNotesByUser = async (req, res) => {
  const userId = req.user.id;

  try {
    const result = await pool.query(
      'SELECT id, usr_id, nte_dat, nte_txt, cre_dat, upd_dat FROM nte.t_nte WHERE usr_id = $1 ORDER BY nte_dat DESC',
      [userId]
    );
    res.json({ success: true, notes: result.rows });
  } catch (error) {
    console.error('Get notes error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};