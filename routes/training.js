import express from 'express';
import {
  getTrainingCategories,
  addTrainingCategory,
  getAllTrainings,
  getTrainingsByCategory,
  addTraining
} from '../controllers/trainingController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(verifyToken); // All routes require authentication

// Training categories
router.get('/trainings/categories', getTrainingCategories);
router.post('/trainings/categories', addTrainingCategory);

// Trainings
router.get('/trainings', getAllTrainings);
router.get('/trainings/category/:cat_id', getTrainingsByCategory);
router.post('/trainings', addTraining);

export default router;