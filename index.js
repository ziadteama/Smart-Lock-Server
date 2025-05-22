// index.js
import express from 'express';
import pinRoutes from './routes/pinRoutes.js';
import faceRoutes from './routes/faceRoutes.js';
import keypadRoutes from './routes/keypadRoutes.js';
import lockRoutes from './routes/lockRoutes.js';

import {
  connect,
  subscribe
} from './services/mqttService.js';

const app = express();
app.use(express.json());

// Mount route modules
app.use('/api/pin', pinRoutes);
app.use('/api/face', faceRoutes);
app.use('/api/keypad', keypadRoutes);
app.use('/api/lock', lockRoutes);

// Start server
app.listen(3000, () => {
  console.log("🚀 Server running on port 3000");
});

// Connect to MQTT broker
connect('mqtt://broker.hivemq.com');

// Subscribe to ESP32 status updates
subscribe('lock/status', (message) => {
  console.log('📥 [ESP32 STATUS]:', message);
});
