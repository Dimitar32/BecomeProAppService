import express from 'express';
import { addNote, deleteNote, updateNote, getNotesByUser } from '../controllers/notesController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(verifyToken); // All routes require authentication

// Get all notes for the logged-in user
router.get('/note', getNotesByUser);

// Add a new note
router.post('/note', addNote);

// Update a note by ID
router.put('/note/:id', updateNote);

// Delete a note by ID
router.delete('/note/:id', deleteNote);

export default router;