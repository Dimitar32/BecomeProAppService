import express from 'express';
import { getRankings } from '../controllers/rankingsController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(verifyToken);

router.get('/trainings/rankings', getRankings);

export default router;
