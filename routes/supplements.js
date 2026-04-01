import express from 'express';
import {
  getSupplements,
  addSupplement,
  updateSupplement,
  deleteSupplement,
  getSupplementLog,
  toggleSupplementTaken,
} from '../controllers/supplementsController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(verifyToken);

// Supplement list (CRUD)
router.get('/supplements', getSupplements);
router.post('/supplements', addSupplement);
router.put('/supplements/:id', updateSupplement);
router.delete('/supplements/:id', deleteSupplement);

// Daily log
router.get('/supplements/log', getSupplementLog);
router.post('/supplements/log', toggleSupplementTaken);

export default router;
