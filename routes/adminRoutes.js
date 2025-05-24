// routes/adminRoutes.js

import express from 'express';
import { acceptUser, rejectUser } from '../controllers/adminController.js';

const router = express.Router();

// Accept user (PUT or POST)
router.put('/users/:userId/accept', acceptUser);

// Reject user (DELETE)
router.delete('/users/:userId/reject', (req, res, next) => {
  console.log('DELETE /users/:userId/reject called with userId:', req.params.userId);
  next();
}, rejectUser);


export default router;
