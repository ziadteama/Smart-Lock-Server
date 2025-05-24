import express from 'express';
import { requireJWT } from '../middlewares/requireJWT.js';
import { requireRole } from '../middlewares/requireRole.js';
import { acceptUser, rejectUser } from '../controllers/adminController.js';

const router = express.Router();

// Only admins can accept or reject pending users
router.post('/users/:userId/accept', requireJWT, requireRole('admin'), acceptUser);
router.post('/users/:userId/reject', requireJWT, requireRole('admin'), rejectUser);

export default router;
