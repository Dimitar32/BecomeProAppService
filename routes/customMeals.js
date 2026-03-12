import express from 'express';
import { getCustomMeals, createCustomMeal, deleteCustomMeal } from '../controllers/customMealsController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(verifyToken);

router.get('/custom-meals', getCustomMeals);
router.post('/custom-meals', createCustomMeal);
router.delete('/custom-meals/:id', deleteCustomMeal);

export default router;
