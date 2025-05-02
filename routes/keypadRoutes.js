// routes/keypadRoutes.js

import { Router } from 'express';
import { verifyPinFromKeypad } from '../controllers/keypadController.js';

const router = Router();

router.post('/verify', verifyPinFromKeypad); // No requireLogin needed

export default router;
