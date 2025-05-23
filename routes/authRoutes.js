// routes/authRoutes.js
import express from 'express';
import { login, logout, signup, getCurrentUser, requireJWT } from '../controllers/authController.js';

const router = express.Router();

// Public routes
router.post('/signup', signup);
router.post('/login', login);

// Protected routes
router.post('/logout', requireJWT, logout);
router.get('/current_user', requireJWT, getCurrentUser);

export default router;
