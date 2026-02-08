import pool from '../utils/db.js';

// --- CATEGORY METHODS ---

export const getExerciseCategories = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, created_at FROM bp.exercise_categories ORDER BY name'
    );
    res.json({ success: true, categories: result.rows });
  } catch (error) {
    console.error('Get exercise categories error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

export const addExerciseCategory = async (req, res) => {
  const { name } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO bp.exercise_categories (name) VALUES ($1) RETURNING id, name, created_at',
      [name]
    );
    res.status(201).json({ success: true, category: result.rows[0] });
  } catch (error) {
    console.error('Add exercise category error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

export const updateExerciseCategory = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  try {
    const result = await pool.query(
      'UPDATE bp.exercise_categories SET name = $1 WHERE id = $2 RETURNING id, name, created_at',
      [name, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    res.json({ success: true, category: result.rows[0] });
  } catch (error) {
    console.error('Update exercise category error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

export const deleteExerciseCategory = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'DELETE FROM bp.exercise_categories WHERE id = $1 RETURNING id',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    res.json({ success: true, message: 'Category deleted' });
  } catch (error) {
    console.error('Delete exercise category error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// --- EXERCISE METHODS ---

export const getExercises = async (req, res) => {
  const { category_id } = req.query;
  try {
    const result = await pool.query(
      `SELECT e.id, e.name, e.category_id, c.name AS category, e.image_url, e.description, e.created_at
       FROM bp.exercise e
       JOIN bp.exercise_categories c ON e.category_id = c.id
       WHERE ($1::bigint IS NULL OR e.category_id = $1)
       ORDER BY e.name`,
      [category_id || null]
    );
    res.json({ success: true, exercises: result.rows });
  } catch (error) {
    console.error('Get exercises error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

export const addExercise = async (req, res) => {
  const { name, category_id, image_url, description } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO bp.exercise (name, category_id, image_url, description)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, category_id, image_url, description, created_at`,
      [name, category_id, image_url, description]
    );
    res.status(201).json({ success: true, exercise: result.rows[0] });
  } catch (error) {
    console.error('Add exercise error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

export const updateExercise = async (req, res) => {
  const { id } = req.params;
  const { name, category_id, image_url, description } = req.body;
  try {
    const result = await pool.query(
      `UPDATE bp.exercise
       SET name = $1, category_id = $2, image_url = $3, description = $4
       WHERE id = $5
       RETURNING id, name, category_id, image_url, description, created_at`,
      [name, category_id, image_url, description, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Exercise not found' });
    }
    res.json({ success: true, exercise: result.rows[0] });
  } catch (error) {
    console.error('Update exercise error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

export const deleteExercise = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'DELETE FROM bp.exercise WHERE id = $1 RETURNING id',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Exercise not found' });
    }
    res.json({ success: true, message: 'Exercise deleted' });
  } catch (error) {
    console.error('Delete exercise error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// --- WORKOUT SESSION METHODS ---

export const getWorkoutSessions = async (req, res) => {
  const userId = req.user.id;
  try {
    const result = await pool.query(
      `SELECT id, user_id, started_at, note, created_at
       FROM bp.workout_session
       WHERE user_id = $1
       ORDER BY started_at DESC`,
      [userId]
    );
    res.json({ success: true, sessions: result.rows });
  } catch (error) {
    console.error('Get workout sessions error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

export const getWorkoutSessionById = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  try {
    const result = await pool.query(
      `SELECT id, user_id, started_at, note, created_at
       FROM bp.workout_session
       WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Workout session not found' });
    }
    res.json({ success: true, session: result.rows[0] });
  } catch (error) {
    console.error('Get workout session error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

export const addWorkoutSession = async (req, res) => {
  const userId = req.user.id;
  const { started_at, note } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO bp.workout_session (user_id, started_at, note)
       VALUES ($1, $2, $3)
       RETURNING id, user_id, started_at, note, created_at`,
      [userId, started_at, note]
    );
    res.status(201).json({ success: true, session: result.rows[0] });
  } catch (error) {
    console.error('Add workout session error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

export const updateWorkoutSession = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  const { started_at, note } = req.body;
  try {
    const result = await pool.query(
      `UPDATE bp.workout_session
       SET started_at = $1, note = $2
       WHERE id = $3 AND user_id = $4
       RETURNING id, user_id, started_at, note, created_at`,
      [started_at, note, id, userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Workout session not found' });
    }
    res.json({ success: true, session: result.rows[0] });
  } catch (error) {
    console.error('Update workout session error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

export const deleteWorkoutSession = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  try {
    const result = await pool.query(
      'DELETE FROM bp.workout_session WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Workout session not found' });
    }
    res.json({ success: true, message: 'Workout session deleted' });
  } catch (error) {
    console.error('Delete workout session error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// --- EXERCISE LOG METHODS ---

export const getExerciseLogsBySession = async (req, res) => {
  const userId = req.user.id;
  const { sessionId } = req.params;
  try {
    const result = await pool.query(
      `SELECT l.id, l.workout_session_id, l.exercise_id, e.name AS exercise, l.note, l.created_at
       FROM bp.exercise_log l
       JOIN bp.workout_session w ON l.workout_session_id = w.id
       JOIN bp.exercise e ON l.exercise_id = e.id
       WHERE l.workout_session_id = $1 AND w.user_id = $2
       ORDER BY l.id`,
      [sessionId, userId]
    );
    res.json({ success: true, logs: result.rows });
  } catch (error) {
    console.error('Get exercise logs error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

export const addExerciseLog = async (req, res) => {
  const userId = req.user.id;
  const { sessionId } = req.params;
  const { exercise_id, note } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO bp.exercise_log (workout_session_id, exercise_id, note)
       SELECT $1, $2, $3
       WHERE EXISTS (
         SELECT 1 FROM bp.workout_session
         WHERE id = $1 AND user_id = $4
       )
       RETURNING id, workout_session_id, exercise_id, note, created_at`,
      [sessionId, exercise_id, note, userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Workout session not found' });
    }
    res.status(201).json({ success: true, log: result.rows[0] });
  } catch (error) {
    console.error('Add exercise log error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

export const updateExerciseLog = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  const { exercise_id, note } = req.body;
  try {
    const result = await pool.query(
      `UPDATE bp.exercise_log l
       SET exercise_id = $1, note = $2
       FROM bp.workout_session w
       WHERE l.workout_session_id = w.id
         AND l.id = $3
         AND w.user_id = $4
       RETURNING l.id, l.workout_session_id, l.exercise_id, l.note, l.created_at`,
      [exercise_id, note, id, userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Exercise log not found' });
    }
    res.json({ success: true, log: result.rows[0] });
  } catch (error) {
    console.error('Update exercise log error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

export const deleteExerciseLog = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  try {
    const result = await pool.query(
      `DELETE FROM bp.exercise_log l
       USING bp.workout_session w
       WHERE l.workout_session_id = w.id
         AND l.id = $1
         AND w.user_id = $2
       RETURNING l.id`,
      [id, userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Exercise log not found' });
    }
    res.json({ success: true, message: 'Exercise log deleted' });
  } catch (error) {
    console.error('Delete exercise log error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// --- EXERCISE LOG SET METHODS ---

export const getSetsByExerciseLog = async (req, res) => {
  const userId = req.user.id;
  const { logId } = req.params;
  try {
    const result = await pool.query(
      `SELECT s.id, s.exercise_log_id, s.set_order, s.reps, s.weight_kg, s.created_at
       FROM bp.exercise_log_set s
       JOIN bp.exercise_log l ON s.exercise_log_id = l.id
       JOIN bp.workout_session w ON l.workout_session_id = w.id
       WHERE s.exercise_log_id = $1 AND w.user_id = $2
       ORDER BY s.set_order`,
      [logId, userId]
    );
    res.json({ success: true, sets: result.rows });
  } catch (error) {
    console.error('Get exercise log sets error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

export const addExerciseLogSet = async (req, res) => {
  const userId = req.user.id;
  const { logId } = req.params;
  const { set_order, reps, weight_kg } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO bp.exercise_log_set (exercise_log_id, set_order, reps, weight_kg)
       SELECT $1, $2, $3, $4
       WHERE EXISTS (
         SELECT 1
         FROM bp.exercise_log l
         JOIN bp.workout_session w ON l.workout_session_id = w.id
         WHERE l.id = $1 AND w.user_id = $5
       )
       RETURNING id, exercise_log_id, set_order, reps, weight_kg, created_at`,
      [logId, set_order, reps, weight_kg, userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Exercise log not found' });
    }
    res.status(201).json({ success: true, set: result.rows[0] });
  } catch (error) {
    console.error('Add exercise log set error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

export const updateExerciseLogSet = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  const { set_order, reps, weight_kg } = req.body;
  try {
    const result = await pool.query(
      `UPDATE bp.exercise_log_set s
       SET set_order = $1, reps = $2, weight_kg = $3
       FROM bp.exercise_log l
       JOIN bp.workout_session w ON l.workout_session_id = w.id
       WHERE s.exercise_log_id = l.id
         AND s.id = $4
         AND w.user_id = $5
       RETURNING s.id, s.exercise_log_id, s.set_order, s.reps, s.weight_kg, s.created_at`,
      [set_order, reps, weight_kg, id, userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Exercise log set not found' });
    }
    res.json({ success: true, set: result.rows[0] });
  } catch (error) {
    console.error('Update exercise log set error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

export const deleteExerciseLogSet = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  try {
    const result = await pool.query(
      `DELETE FROM bp.exercise_log_set s
       USING bp.exercise_log l, bp.workout_session w
       WHERE s.exercise_log_id = l.id
         AND l.workout_session_id = w.id
         AND s.id = $1
         AND w.user_id = $2
       RETURNING s.id`,
      [id, userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Exercise log set not found' });
    }
    res.json({ success: true, message: 'Exercise log set deleted' });
  } catch (error) {
    console.error('Delete exercise log set error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// --- PROGRESS METHODS ---

export const getExerciseHistory = async (req, res) => {
  const userId = req.user.id;
  const { exercise_id } = req.query;
  if (!exercise_id) {
    return res.status(400).json({ success: false, message: 'exercise_id is required' });
  }
  try {
    const result = await pool.query(
      `SELECT w.started_at, l.id AS log_id, s.set_order, s.reps, s.weight_kg
       FROM bp.exercise_log_set s
       JOIN bp.exercise_log l ON s.exercise_log_id = l.id
       JOIN bp.workout_session w ON l.workout_session_id = w.id
       WHERE w.user_id = $1 AND l.exercise_id = $2
       ORDER BY w.started_at DESC, s.set_order ASC`,
      [userId, exercise_id]
    );
    res.json({ success: true, history: result.rows });
  } catch (error) {
    console.error('Get exercise history error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

export const getExerciseVolume = async (req, res) => {
  const userId = req.user.id;
  const { exercise_id } = req.query;
  try {
    const result = await pool.query(
      `SELECT
         CASE WHEN $2::bigint IS NULL THEN NULL ELSE l.exercise_id END AS exercise_id,
         DATE(w.started_at) AS day,
         SUM(s.reps * s.weight_kg) AS volume
       FROM bp.exercise_log_set s
       JOIN bp.exercise_log l ON s.exercise_log_id = l.id
       JOIN bp.workout_session w ON l.workout_session_id = w.id
       WHERE w.user_id = $1
         AND ($2::bigint IS NULL OR l.exercise_id = $2)
       GROUP BY CASE WHEN $2::bigint IS NULL THEN NULL ELSE l.exercise_id END, DATE(w.started_at)
       ORDER BY day DESC`,
      [userId, exercise_id || null]
    );
    res.json({ success: true, volume: result.rows });
  } catch (error) {
    console.error('Get exercise volume error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

export const getExerciseMax = async (req, res) => {
  const userId = req.user.id;
  const { exercise_id } = req.query;
  if (!exercise_id) {
    return res.status(400).json({ success: false, message: 'exercise_id is required' });
  }
  try {
    const result = await pool.query(
      `SELECT MAX(s.weight_kg) AS max_weight
       FROM bp.exercise_log_set s
       JOIN bp.exercise_log l ON s.exercise_log_id = l.id
       JOIN bp.workout_session w ON l.workout_session_id = w.id
       WHERE w.user_id = $1 AND l.exercise_id = $2`,
      [userId, exercise_id]
    );
    res.json({ success: true, max: result.rows[0] });
  } catch (error) {
    console.error('Get exercise max error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};
