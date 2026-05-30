import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import passportConfig from './config/passport.js'; // Ensure passport is configured
import authRoutes from './routes/auth.routes.js';
import skillRoutes from './routes/skill.routes.js';
import internshipRoutes from './routes/internship.routes.js';
import aiGatewayRoutes from './routes/ai-gateway.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve uploaded files (CV, etc.)
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

import adminRoutes from './routes/admin.routes.js';
import applicationRoutes from './routes/application.routes.js';

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/internships', internshipRoutes);
app.use('/api/ai', aiGatewayRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/applications', applicationRoutes);

// Base route for testing
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Express REST API with JWT & OAuth' });
});

// Global error handler (basic)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

export default app;
