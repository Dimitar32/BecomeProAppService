import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import profileRoutes from './routes/profile.js';
import trainingRoutes from './routes/training.js';
import rankingsRoutes from './routes/rankings.js';
import nutritionRoutes from './routes/nutrition.js';
import customMealsRoutes from './routes/customMeals.js';
import { errorHandler } from './middleware/errorMiddleware.js';
import { loggerMiddleware } from './middleware/loggerMiddleware.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json()); // Parse JSON payloads
app.use(
  cors({
    origin: [
      /^http:\/\/localhost:\d+$/,
      'https://becomepro.netlify.app',
    ],
    credentials: true,
  })
);

app.use(loggerMiddleware); // Log all requests

// Routes
app.use('/api', authRoutes);       // Authentication routes
app.use('/api', profileRoutes);
app.use('/api', trainingRoutes);
app.use('/api', rankingsRoutes);
app.use('/api', nutritionRoutes);
app.use('/api', customMealsRoutes);

// Error Handling Middleware
app.use(errorHandler);

// Start Server
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
