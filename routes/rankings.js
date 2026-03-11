import express from 'express';
import { getRankings, getUserSessionsForPeriod } from '../controllers/rankingsController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(verifyToken);

router.get('/trainings/rankings', getRankings);
router.get('/trainings/rankings/user-sessions', getUserSessionsForPeriod);

export default router;
