import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import profileRoutes from './routes/profile.js';
import articleRoutes from './routes/article.js';
import noteRoutes from './routes/note.js';
import trainingRoutes from './routes/training.js';
import { errorHandler } from './middleware/errorMiddleware.js';
import { loggerMiddleware } from './middleware/loggerMiddleware.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json()); // Parse JSON payloads
// app.use(cors());         // Enable CORS for all origins
app.use(cors({
  origin: 'https://becomepro.netlify.app', // or 'https://luminis.com' if that's the full domain//https://becomepro.netlify.app
  credentials: true
}));

app.use(loggerMiddleware); // Log all requests

// Routes
app.use('/api', authRoutes);       // Authentication routes
app.use('/api', profileRoutes);
app.use('/api', articleRoutes);
app.use('/api', noteRoutes);
app.use('/api', trainingRoutes);

// Error Handling Middleware
app.use(errorHandler);

// Start Server
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
