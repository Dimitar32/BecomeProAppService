import pool from '../utils/db.js';

// Get all custom meals for the current user
export const getCustomMeals = async (req, res) => {
  const userId = req.user.id;
  try {
    const result = await pool.query(
      `SELECT id, name, amount_grams, calories, protein, carbs, fats, created_at
       FROM bp.custom_meals
       WHERE user_id = $1
       ORDER BY name`,
      [userId]
    );
    res.json({ success: true, meals: result.rows });
  } catch (error) {
    console.error('Get custom meals error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// Create a new custom meal
export const createCustomMeal = async (req, res) => {
  const userId = req.user.id;
  const { name, amount_grams, calories, protein, carbs, fats } = req.body;
  if (!name || calories == null) {
    return res.status(400).json({ success: false, message: 'name and calories are required' });
  }
  try {
    const result = await pool.query(
      `INSERT INTO bp.custom_meals (user_id, name, amount_grams, calories, protein, carbs, fats)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, name, amount_grams, calories, protein, carbs, fats, created_at`,
      [userId, name.trim(), amount_grams || null, calories, protein || 0, carbs || 0, fats || 0]
    );
    res.status(201).json({ success: true, meal: result.rows[0] });
  } catch (error) {
    console.error('Create custom meal error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// Delete a custom meal
export const deleteCustomMeal = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  try {
    const result = await pool.query(
      'DELETE FROM bp.custom_meals WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Custom meal not found' });
    }
    res.json({ success: true, message: 'Custom meal deleted' });
  } catch (error) {
    console.error('Delete custom meal error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};
