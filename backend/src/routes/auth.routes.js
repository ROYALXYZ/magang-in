import express from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import { register, login, logout, getProfile, updateProfile, requestMitra } from '../controllers/auth.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// Local Auth Routes
router.post('/register', register);
router.post('/login', login);
router.post('/logout', verifyToken, logout);

// OAuth Google Routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/api/auth/google/failure' }),
  (req, res) => {
    // Successful authentication, output a JWT.
    const token = jwt.sign({ id: req.user.id }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });

    // Send token back to client, usually via redirect with token in query params
    // or just return as json if the client handles popup/callback Window
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}?token=${token}`);
  }
);

router.get('/google/failure', (req, res) => {
  res.status(401).json({ message: 'Google OAuth failed' });
});

// Profile Routes
router.get('/profile', verifyToken, getProfile);
router.put('/profile', verifyToken, updateProfile);

// Request Mitra
router.post('/request-mitra', verifyToken, requestMitra);

export default router;
