import express from 'express';
import {
  login,
  logout,
  signup,
  getCurrentUser
} from '../controllers/authController.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);
router.get('/current_user', getCurrentUser);

export default router;