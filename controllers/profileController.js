import pool from '../utils/db.js';
// import jwt from 'jsonwebtoken';

// const SECRET_KEY = process.env.JWT_SECRET;

// // Helper to get user ID from JWT
// const getUserIdFromToken = (req) => {
//   const authHeader = req.headers.authorization;
//   if (!authHeader) return null;
//   const token = authHeader.split(' ')[1];
//   try {
//     const decoded = jwt.verify(token, SECRET_KEY);
//     return decoded.id;
//   } catch {
//     return null;
//   }
// };

// Get profile info
export const getProfile = async (req, res) => {
  const userId = req.user.id; // Use user ID from middleware
  if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

  try {
    const user = await pool.query(
      'SELECT id, fst_nme, lst_nme, eml, usr_nme, cre_dat, cre_by, upd_dat, upd_by FROM usr.t_usr WHERE id = $1',
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
  const userId = req.user.id; // Use user ID from middleware
  if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

  const { firstName, lastName, email } = req.body;
  const upd_by = `${firstName} ${lastName}`;

  try {
    const result = await pool.query(
      `UPDATE usr.t_usr
       SET fst_nme = $1, lst_nme = $2, eml = $3, upd_dat = NOW(), upd_by = $4
       WHERE id = $5
       RETURNING id, fst_nme, lst_nme, eml, usr_nme, cre_dat, cre_by, upd_dat, upd_by`,
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