import express from 'express';
import { lock, unlock } from '../controllers/espController.js';

const router = express.Router();

router.post('/lock', lock);
router.post('/unlock', unlock);

export default router;
     