import pool from '../utils/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET;

// Login Controller
export const login = async (req, res) => {
  const { userName, password } = req.body;

  console.log('Login request body:', req.body);

  try {
    const user = await pool.query('SELECT * FROM bp.t_usr WHERE usr_nme = $1', [userName]);
    console.log('User query result:', user.rows);

    if (user.rows.length === 0) {
      console.log('No user found with username:', userName);
      return res.status(401).json({ success: false, message: 'Invalid username or password' });
    }

    const validPassword = await bcrypt.compare(password, user.rows[0].pass);
    console.log('Password valid:', validPassword);

    if (!validPassword) {
      console.log('Invalid password for user:', userName);
      return res.status(401).json({ success: false, message: 'Invalid username or password' });
    }

    const token = jwt.sign({ id: user.rows[0].id, usr_nme: user.rows[0].usr_nme }, SECRET_KEY, {
      expiresIn: '2h',
    });
    console.log('Generated JWT token:', token);

    res.json({ success: true, token, message: 'Login successful' });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// Register Controller
export const register = async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    userName,
    password
  } = req.body;

  // Concatenate firstName and lastName for cre_by and upd_by
  const fullName = `${firstName} ${lastName}`;

  console.log('Register request body:', req.body);
  console.log('Full name for cre_by/upd_by:', fullName);

  try {
    // Check if username or email already exists
    const userExists = await pool.query(
      'SELECT * FROM bp.t_usr WHERE usr_nme = $1 OR eml = $2',
      [userName, email]
    );
    console.log('User exists query result:', userExists.rows);

    if (userExists.rows.length > 0) {
      console.log('Username or email already exists');
      return res.status(400).json({ success: false, message: 'Username or email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Hashed password:', hashedPassword);

    // Insert new user
    const newUser = await pool.query(
      `INSERT INTO bp.t_usr 
        (fst_nme, lst_nme, eml, usr_nme, pass, cre_by, upd_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, usr_nme, eml`,
      [firstName, lastName, email, userName, hashedPassword, fullName, fullName]
    );
    console.log('New user insert result:', newUser.rows);

    // Generate JWT token
    const token = jwt.sign(
      { id: newUser.rows[0].id, username: newUser.rows[0].usr_nme },
      SECRET_KEY,
      { expiresIn: '2h' }
    );
    console.log('Generated JWT token:', token);

    res.status(201).json({ success: true, token, message: 'Registration successful' });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};
