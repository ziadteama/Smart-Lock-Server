// routes/faceRoutes.js

import { Router } from 'express';
import * as faceController from '../controllers/faceController.js';
import requireLogin from '../middleware/requireLogin.js';

const router = Router();

router.post('/register', requireLogin, faceController.registerFace);
router.post('/verify', requireLogin, faceController.verifyFace);
router.delete('/:userId', requireLogin, faceController.deleteFace);

export default router;
