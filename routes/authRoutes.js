import express from 'express';
import {
  signup,
  login,
  logout,
  getCurrentUser
} from '../controllers/authController.js';
import { requireLogin } from '../middlewares/requireLogin.js';

const router = express.Router();

// Public routes
router.post('/signup', signup);
router.post('/login', login);

// Protected routes
router.post('/logout', requireLogin, logout);
router.get('/current_user', requireLogin, getCurrentUser);

export default router;
