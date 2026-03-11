import express from 'express';
import {
  getNutritionByDate,
  getNutritionSummary,
  addNutritionLog,
  updateNutritionLog,
  deleteNutritionLog,
} from '../controllers/nutritionController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(verifyToken);

// Get logs for a specific date
router.get('/nutrition/logs', getNutritionByDate);

// Get summary (totals per day) for a date range
router.get('/nutrition/summary', getNutritionSummary);

// Add a new nutrition log
router.post('/nutrition/logs', addNutritionLog);

// Update a nutrition log
router.put('/nutrition/logs/:id', updateNutritionLog);

// Delete a nutrition log
router.delete('/nutrition/logs/:id', deleteNutritionLog);

export default router;
