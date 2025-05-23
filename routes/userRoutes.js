// routes/userRoutes.js
import express from 'express';
import { getAllUsers, requireAdmin } from '../controllers/userController.js';
import { requireLogin } from '../middlewares/requireLogin.js';

const router = express.Router();

// Only admins can access this endpoint
router.get('/all', requireLogin, requireAdmin, getAllUsers);

export default router;
