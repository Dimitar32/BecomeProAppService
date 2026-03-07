import pool from '../utils/db.js';

async function getPeriodBounds(period, refDate) {
  const ref = refDate || new Date().toISOString();
  const sql =
    period === 'week'
      ? `SELECT date_trunc('week', $1::timestamptz) AS "from",
                date_trunc('week', $1::timestamptz) + interval '6 days 23:59:59.999' AS "to"`
      : `SELECT date_trunc('month', $1::timestamptz) AS "from",
                date_trunc('month', $1::timestamptz) + interval '1 month' - interval '1 millisecond' AS "to"`;
  const result = await pool.query(sql, [ref]);
  return result.rows[0];
}

async function maxExerciseRanking(from, to, patterns) {
  const paramPlaceholders = patterns.map((_, i) => `e.name ILIKE $${i + 3}`).join(' OR ');
  const result = await pool.query(
    `WITH best_sets AS (
       SELECT DISTINCT ON (u.id)
         u.id          AS user_id,
         u.usr_nme     AS username,
         s.weight_kg   AS max_weight,
         s.reps,
         DATE(w.started_at) AS date
       FROM bp.exercise_log_set s
       JOIN bp.exercise_log    l ON s.exercise_log_id    = l.id
       JOIN bp.workout_session w ON l.workout_session_id = w.id
       JOIN bp.exercise        e ON l.exercise_id        = e.id
       JOIN bp.t_usr            u ON w.user_id            = u.id
       WHERE w.started_at >= $1 AND w.started_at <= $2
         AND (${paramPlaceholders})
       ORDER BY u.id, s.weight_kg DESC
     )
     SELECT
       ROW_NUMBER() OVER (ORDER BY max_weight DESC) AS rank,
       user_id, username, max_weight, reps, date
     FROM best_sets
     ORDER BY max_weight DESC
     LIMIT 20`,
    [from, to, ...patterns]
  );
  return result.rows;
}

export const getRankings = async (req, res) => {
  const { period = 'week', date } = req.query;

  if (!['week', 'month'].includes(period)) {
    return res.status(400).json({ success: false, message: 'period must be "week" or "month"' });
  }

  try {
    const { from, to } = await getPeriodBounds(period, date);

    const [sessionsResult, volumeResult, benchRows] = await Promise.all([
      pool.query(
        `SELECT
           ROW_NUMBER() OVER (ORDER BY COUNT(w.id) DESC) AS rank,
           u.id       AS user_id,
           u.usr_nme  AS username,
           COUNT(w.id)::int AS session_count
         FROM bp.workout_session w
         JOIN bp.t_usr u ON w.user_id = u.id
         WHERE w.started_at >= $1 AND w.started_at <= $2
         GROUP BY u.id, u.usr_nme
         ORDER BY session_count DESC
         LIMIT 20`,
        [from, to]
      ),

      pool.query(
        `SELECT
           ROW_NUMBER() OVER (ORDER BY SUM(s.reps * s.weight_kg) DESC) AS rank,
           u.id      AS user_id,
           u.usr_nme AS username,
           ROUND(SUM(s.reps * s.weight_kg)::numeric, 2) AS total_volume
         FROM bp.exercise_log_set s
         JOIN bp.exercise_log    l ON s.exercise_log_id    = l.id
         JOIN bp.workout_session w ON l.workout_session_id = w.id
         JOIN bp.t_usr           u ON w.user_id            = u.id
         WHERE w.started_at >= $1 AND w.started_at <= $2
         GROUP BY u.id, u.usr_nme
         ORDER BY total_volume DESC
         LIMIT 20`,
        [from, to]
      ),

      maxExerciseRanking(from, to, ['%лежанка%']),
    ]);

    res.json({
      success: true,
      period,
      from: from.toISOString().split('T')[0],
      to: to.toISOString().split('T')[0],
      most_sessions: sessionsResult.rows,
      total_volume: volumeResult.rows,
      max_bench_press: benchRows,
    });
  } catch (error) {
    console.error('Get rankings error:', error);
    res.status(500).json({ success: false, message: error.message, detail: error.detail ?? null });
  }
};
