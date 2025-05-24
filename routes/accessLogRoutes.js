import express from 'express';
import { getAccessLogs } from '../controllers/accessLogController.js';


const router = express.Router();

router.get('/',  getAccessLogs);

export default router;
