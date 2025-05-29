import pool from '../utils/db.js';

// Dummy admin check (replace with your real logic)
const isAdmin = (req) => req.user && req.user.isAdmin;

// --- CATEGORY METHODS ---

// Get all categories
export const getCategories = async (req, res) => {
  try {
    const result = await pool.query('SELECT id, nme, slg, cre_dat FROM art.t_cat ORDER BY nme');
    res.json({ success: true, categories: result.rows });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// Add a new category (admin only)
export const addCategory = async (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ success: false, message: 'Forbidden' });
  const { nme, slg } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO art.t_cat (nme, slg) VALUES ($1, $2) RETURNING id, nme, slg, cre_dat',
      [nme, slg]
    );
    res.status(201).json({ success: true, category: result.rows[0] });
  } catch (error) {
    console.error('Add category error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// Update a category (admin only)
export const updateCategory = async (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ success: false, message: 'Forbidden' });
  const { id, nme, slg } = req.body;
  try {
    const result = await pool.query(
      'UPDATE art.t_cat SET nme = $1, slg = $2 WHERE id = $3 RETURNING id, nme, slg, cre_dat',
      [nme, slg, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    res.json({ success: true, category: result.rows[0] });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// --- ARTICLE METHODS ---

// Add a new article (admin only)
export const addArticle = async (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ success: false, message: 'Forbidden' });
  const { cat_id, ttl, slg, exc, txt } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO art.t_art (cat_id, ttl, slg, exc, txt)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, cat_id, ttl, slg, exc, txt, cre_dat, upd_dat`,
      [cat_id, ttl, slg, exc, txt]
    );
    res.status(201).json({ success: true, article: result.rows[0] });
  } catch (error) {
    console.error('Add article error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// Get all articles (admin only)
export const getAllArticles = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT a.id, a.cat_id, c.nme as category, a.ttl, a.slg, a.exc, a.txt, a.cre_dat, a.upd_dat
       FROM art.t_art a
       JOIN art.t_cat c ON a.cat_id = c.id
       ORDER BY a.cre_dat DESC`
    );
    res.json({ success: true, articles: result.rows });
  } catch (error) {
    console.error('Get all articles error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// Get articles by category (admin only)
export const getArticlesByCategory = async (req, res) => {
  const { cat_id } = req.params;
  try {
    const result = await pool.query(
      `SELECT id, cat_id, ttl, slg, exc, txt, cre_dat, upd_dat
       FROM art.t_art
       WHERE cat_id = $1
       ORDER BY cre_dat DESC`,
      [cat_id]
    );
    res.json({ success: true, articles: result.rows });
  } catch (error) {
    console.error('Get articles by category error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// Update an article (admin only)
export const updateArticle = async (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ success: false, message: 'Forbidden' });
  const { id, cat_id, ttl, slg, exc, txt } = req.body;
  try {
    const result = await pool.query(
      `UPDATE art.t_art
       SET cat_id = $1, ttl = $2, slg = $3, exc = $4, txt = $5, upd_dat = NOW()
       WHERE id = $6
       RETURNING id, cat_id, ttl, slg, exc, txt, cre_dat, upd_dat`,
      [cat_id, ttl, slg, exc, txt, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Article not found' });
    }
    res.json({ success: true, article: result.rows[0] });
  } catch (error) {
    console.error('Update article error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};