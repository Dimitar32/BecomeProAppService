import express from 'express';
import {
  getProfile,
  updateProfile,
  updateHeight,
  updateTargetWeight,
  getBodyLog,
  addBodyLog,
  deleteBodyLog,
} from '../controllers/profileController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(verifyToken);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.patch('/profile/height', updateHeight);
router.patch('/profile/target-weight', updateTargetWeight);

router.get('/body-log', getBodyLog);
router.post('/body-log', addBodyLog);
router.delete('/body-log/:id', deleteBodyLog);

export default router;