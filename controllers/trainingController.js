import pool from '../utils/db.js';

// --- CATEGORY METHODS ---

// Get all training categories
export const getTrainingCategories = async (req, res) => {
  try {
    const result = await pool.query('SELECT id, nme, dsc, cre_dat FROM trn.t_cat ORDER BY nme');
    res.json({ success: true, categories: result.rows });
  } catch (error) {
    console.error('Get training categories error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// Add a new training category (admin only)
export const addTrainingCategory = async (req, res) => {
  if (!req.user?.isAdmin) return res.status(403).json({ success: false, message: 'Forbidden' });
  const { nme, dsc } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO trn.t_cat (nme, dsc) VALUES ($1, $2) RETURNING id, nme, dsc, cre_dat',
      [nme, dsc]
    );
    res.status(201).json({ success: true, category: result.rows[0] });
  } catch (error) {
    console.error('Add training category error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// --- TRAINING METHODS ---

// Get all trainings
export const getAllTrainings = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT t.id, t.cat_id, c.nme as category, t.ttl, t.dsc, t.you_tub_lnk, t.cre_dat
       FROM trn.t_trn t
       JOIN trn.t_cat c ON t.cat_id = c.id
       ORDER BY t.cre_dat DESC`
    );
    res.json({ success: true, trainings: result.rows });
  } catch (error) {
    console.error('Get all trainings error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// Get trainings by category
export const getTrainingsByCategory = async (req, res) => {
  const { cat_id } = req.params;
  try {
    const result = await pool.query(
      `SELECT id, cat_id, ttl, dsc, you_tub_lnk, cre_dat
       FROM trn.t_trn
       WHERE cat_id = $1
       ORDER BY cre_dat DESC`,
      [cat_id]
    );
    res.json({ success: true, trainings: result.rows });
  } catch (error) {
    console.error('Get trainings by category error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// Add a new training (admin only)
export const addTraining = async (req, res) => {
  if (!req.user?.isAdmin) return res.status(403).json({ success: false, message: 'Forbidden' });
  const { cat_id, ttl, dsc, you_tub_lnk } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO trn.t_trn (cat_id, ttl, dsc, you_tub_lnk)
       VALUES ($1, $2, $3, $4)
       RETURNING id, cat_id, ttl, dsc, you_tub_lnk, cre_dat`,
      [cat_id, ttl, dsc, you_tub_lnk]
    );
    res.status(201).json({ success: true, training: result.rows[0] });
  } catch (error) {
    console.error('Add training error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};