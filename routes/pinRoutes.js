// routes/pinRoutes.js

import { Router } from 'express';
import * as pinController from '../controllers/pinController.js';
// import requireLogin from '../middleware/requireLogin.js'; // ← Comment this out for now

const router = Router();

// router.post('/set', requireLogin, pinController.setPin);
router.post('/set', pinController.setPin);

// router.post('/verify', requireLogin, pinController.verifyPin);
router.post('/verify', pinController.verifyPin);

// router.put('/update', requireLogin, pinController.updatePin);
router.put('/update', pinController.updatePin);

// router.delete('/delete', requireLogin, pinController.deletePin);
router.delete('/delete', pinController.deletePin);

export default router;
