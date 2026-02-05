import express from 'express';
import {
  getExerciseCategories,
  addExerciseCategory,
  updateExerciseCategory,
  deleteExerciseCategory,
  getExercises,
  addExercise,
  updateExercise,
  deleteExercise,
  getWorkoutSessions,
  getWorkoutSessionById,
  addWorkoutSession,
  updateWorkoutSession,
  deleteWorkoutSession,
  getExerciseLogsBySession,
  addExerciseLog,
  updateExerciseLog,
  deleteExerciseLog,
  getSetsByExerciseLog,
  addExerciseLogSet,
  updateExerciseLogSet,
  deleteExerciseLogSet,
  getExerciseHistory,
  getExerciseVolume,
  getExerciseMax
} from '../controllers/trainingController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(verifyToken);

// Categories
router.get('/trainings/categories', getExerciseCategories);
router.post('/trainings/categories', addExerciseCategory);
router.put('/trainings/categories/:id', updateExerciseCategory);
router.delete('/trainings/categories/:id', deleteExerciseCategory);

// Exercises
router.get('/trainings/exercises', getExercises);
router.post('/trainings/exercises', addExercise);
router.put('/trainings/exercises/:id', updateExercise);
router.delete('/trainings/exercises/:id', deleteExercise);

// Workout sessions
router.get('/trainings/sessions', getWorkoutSessions);
router.get('/trainings/sessions/:id', getWorkoutSessionById);
router.post('/trainings/sessions', addWorkoutSession);
router.put('/trainings/sessions/:id', updateWorkoutSession);
router.delete('/trainings/sessions/:id', deleteWorkoutSession);

// Exercise logs
router.get('/trainings/sessions/:sessionId/logs', getExerciseLogsBySession);
router.post('/trainings/sessions/:sessionId/logs', addExerciseLog);
router.put('/trainings/logs/:id', updateExerciseLog);
router.delete('/trainings/logs/:id', deleteExerciseLog);

// Exercise log sets
router.get('/trainings/logs/:logId/sets', getSetsByExerciseLog);
router.post('/trainings/logs/:logId/sets', addExerciseLogSet);
router.put('/trainings/sets/:id', updateExerciseLogSet);
router.delete('/trainings/sets/:id', deleteExerciseLogSet);

// Progress
router.get('/trainings/progress/history', getExerciseHistory);
router.get('/trainings/progress/volume', getExerciseVolume);
router.get('/trainings/progress/max', getExerciseMax);

export default router;
