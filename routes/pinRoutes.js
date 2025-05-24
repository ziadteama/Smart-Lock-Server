// routes/pinRoutes.js

import express from 'express';
import { updateGlobalPin ,getGlobalPin} from '../controllers/pinController.js';
import { requireJWT } from '../middlewares/requireJWT.js'; // your JWT auth middleware

const router = express.Router();
router.get('/current', getGlobalPin);
// Protect this route with JWT middleware
router.post('/update', requireJWT, updateGlobalPin);

export default router;
