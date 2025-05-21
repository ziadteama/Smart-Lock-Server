// index.js
import express from 'express';
import pinRoutes from './routes/pinRoutes.js';
import faceRoutes from './routes/faceRoutes.js';
import keypadRoutes from './routes/keypadRoutes.js';

import {
  connect,
  subscribe,
  unlockDoor,
  lockDoor,
  sendNotification,
  logAccessEvent
} from './services/mqttService.js';

const app = express();
app.use(express.json());

// Your API routes
app.use('/api/pin', pinRoutes);
app.use('/api/face', faceRoutes);
app.use('/api/keypad', keypadRoutes);

// Start server
app.listen(3000, () => {
  console.log("🚀 Server running on port 3000");
});

// MQTT connection
connect('mqtt://broker.hivemq.com');

// Subscribe to status updates from ESP32
subscribe('lock/status', (message) => {
  console.log('[ESP32 STATUS]:', message);
});

// ✅ Demo usage — you can remove or replace these later
setTimeout(() => {
  unlockDoor();
}, 3000);

setTimeout(() => {
  lockDoor();
}, 6000);

setTimeout(() => {
  sendNotification("Someone is at the door!");
}, 9000);

setTimeout(() => {
  logAccessEvent({
    user: "admin",
    method: "remote",
    success: true,
    timestamp: new Date().toISOString()
  });
}, 12000);
