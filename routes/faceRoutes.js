// routes/faceRoutes.js

import { Router } from 'express';
import * as faceController from '../controllers/faceController.js';
// import requireLogin from '../middleware/requireLogin.js'; // ← Comment this out

const router = Router();

// router.post('/register', requireLogin, faceController.registerFace);
router.post('/register', faceController.registerFace);

// router.post('/verify', requireLogin, faceController.verifyFace);
router.post('/verify', faceController.verifyFace);

// router.delete('/:userId', requireLogin, faceController.deleteFace);
router.delete('/:userId', faceController.deleteFace);

export default router;
