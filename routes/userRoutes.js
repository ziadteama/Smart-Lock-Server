// routes/userRoutes.js
import express from 'express';
import { getAllUsers } from '../controllers/userController.js';
import { requireJWT } from '../middlewares/requireJWT.js';
import { requireRole } from '../middlewares/requireRole.js';


const router = express.Router();

// Only admins can access this endpoint
router.get('/all', requireJWT, requireRole('admin'), getAllUsers);

export default router;
