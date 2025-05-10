import { Router } from 'express';
import * as pinController from '../controllers/pinController.js';
import authMiddleware from '../middleware/requireLogin.js';

const { requireLogin } = authMiddleware;

const router = Router();

router.post('/set', requireLogin, pinController.setPin);
router.post('/verify', requireLogin, pinController.verifyPin);
router.put('/update', requireLogin, pinController.updatePin);
router.delete('/delete', requireLogin, pinController.deletePin);

export default router;
