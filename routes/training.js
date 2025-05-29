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
router.get('/categories', getTrainingCategories);
router.post('/categories', addTrainingCategory);

// Trainings
router.get('/trainings', getAllTrainings);
router.get('/trainings/category/:cat_id', getTrainingsByCategory);
router.post('/trainings', addTraining);

export default router;