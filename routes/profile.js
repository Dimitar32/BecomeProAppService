import express from 'express';
import { getProfile, updateProfile } from '../controllers/profileController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(verifyToken); // All routes below require authentication

// Get profile info
router.get('/profile', getProfile);

// Update profile info
router.put('/profile', updateProfile);

export default router;