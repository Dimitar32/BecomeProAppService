import pool from '../utils/db.js';

// Get all nutrition logs for a specific date
export const getNutritionByDate = async (req, res) => {
  const userId = req.user.id;
  const { date } = req.query;
  if (!date) {
    return res.status(400).json({ success: false, message: 'date is required (YYYY-MM-DD)' });
  }
  try {
    const result = await pool.query(
      `SELECT id, user_id, log_date, food_name, amount_grams, calories, protein, carbs, fats, created_at
       FROM bp.nutrition_log
       WHERE user_id = $1 AND log_date = $2
       ORDER BY created_at`,
      [userId, date]
    );
    res.json({ success: true, logs: result.rows });
  } catch (error) {
    console.error('Get nutrition by date error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// Get nutrition summary (totals) for a date range
export const getNutritionSummary = async (req, res) => {
  const userId = req.user.id;
  const { from, to } = req.query;
  if (!from || !to) {
    return res.status(400).json({ success: false, message: 'from and to are required (YYYY-MM-DD)' });
  }
  try {
    const result = await pool.query(
      `SELECT log_date,
              SUM(calories) AS total_calories,
              SUM(protein) AS total_protein,
              SUM(carbs) AS total_carbs,
              SUM(fats) AS total_fats,
              COUNT(*) AS entries
       FROM bp.nutrition_log
       WHERE user_id = $1 AND log_date >= $2 AND log_date <= $3
       GROUP BY log_date
       ORDER BY log_date`,
      [userId, from, to]
    );
    res.json({ success: true, summary: result.rows });
  } catch (error) {
    console.error('Get nutrition summary error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// Add a nutrition log entry
export const addNutritionLog = async (req, res) => {
  const userId = req.user.id;
  const { log_date, food_name, amount_grams, calories, protein, carbs, fats } = req.body;
  if (!log_date || !food_name || calories == null) {
    return res.status(400).json({ success: false, message: 'log_date, food_name, and calories are required' });
  }
  try {
    const result = await pool.query(
      `INSERT INTO bp.nutrition_log (user_id, log_date, food_name, amount_grams, calories, protein, carbs, fats)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, user_id, log_date, food_name, amount_grams, calories, protein, carbs, fats, created_at`,
      [userId, log_date, food_name, amount_grams || null, calories, protein || 0, carbs || 0, fats || 0]
    );
    res.status(201).json({ success: true, log: result.rows[0] });
  } catch (error) {
    console.error('Add nutrition log error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// Update a nutrition log entry
export const updateNutritionLog = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  const { food_name, amount_grams, calories, protein, carbs, fats } = req.body;
  try {
    const result = await pool.query(
      `UPDATE bp.nutrition_log
       SET food_name = $1, amount_grams = $2, calories = $3, protein = $4, carbs = $5, fats = $6
       WHERE id = $7 AND user_id = $8
       RETURNING id, user_id, log_date, food_name, amount_grams, calories, protein, carbs, fats, created_at`,
      [food_name, amount_grams || null, calories, protein || 0, carbs || 0, fats || 0, id, userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Nutrition log not found' });
    }
    res.json({ success: true, log: result.rows[0] });
  } catch (error) {
    console.error('Update nutrition log error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// Delete a nutrition log entry
export const deleteNutritionLog = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  try {
    const result = await pool.query(
      'DELETE FROM bp.nutrition_log WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Nutrition log not found' });
    }
    res.json({ success: true, message: 'Nutrition log deleted' });
  } catch (error) {
    console.error('Delete nutrition log error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};
