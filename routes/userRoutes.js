import express from 'express';
import { getAllUsers, getPendingUsers } from '../controllers/userController.js';
import { requireJWT} from '../middlewares/requireJWT.js';
import { requireRole} from '../middlewares/requireRole.js';

const router = express.Router();

// Admin-only routes
router.get('/all', requireJWT, requireRole('admin'), getAllUsers);
router.get('/pending', requireJWT, requireRole('admin'), getPendingUsers);

export default router;
