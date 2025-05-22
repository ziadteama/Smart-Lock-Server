// routes/lockRoutes.js
import express from 'express';
import {
  unlockDoor,
  lockDoor,
  sendNotification,
  logAccessEvent
} from '../services/mqttService.js';

const router = express.Router();

router.post('/unlock', (req, res) => {
  unlockDoor();
  res.json({ success: true, message: 'Unlock command sent' });
});

router.post('/lock', (req, res) => {
  lockDoor();
  res.json({ success: true, message: 'Lock command sent' });
});

router.post('/notify', (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }
  sendNotification(message);
  res.json({ success: true, message: 'Notification sent' });
});

router.post('/log/access', (req, res) => {
  const data = req.body;
  logAccessEvent(data);
  res.json({ success: true, message: 'Access log sent' });
});

export default router;
