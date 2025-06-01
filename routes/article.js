import express from 'express';
import * as articlesController from '../controllers/articlesController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(verifyToken); // All routes below require authentication

router.get('/categories', articlesController.getCategories);
router.post('/categories', articlesController.addCategory);
router.put('/categories', articlesController.updateCategory);

router.post('/articles', articlesController.addArticle);
router.get('/articles', articlesController.getAllArticles);
router.get('/articles/:id', articlesController.getArticleById);
router.get('/articles/category/:cat_id', articlesController.getArticlesByCategory);
router.put('/articles', articlesController.updateArticle);

// Get only article titles and ids
router.get('/articles/titles', articlesController.getArticleTitles);

export default router;