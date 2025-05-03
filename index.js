// index.js

import express from 'express';
import pinRoutes from './routes/pinRoutes.js';
import faceRoutes from './routes/faceRoutes.js';
import keypadRoutes from './routes/keypadRoutes.js';
import { connect, subscribe, publish } from './services/mqttService.js';

const app = express();
app.use(express.json());

app.use('/api/pin', pinRoutes);
app.use('/api/face', faceRoutes);
app.use('/api/keypad', keypadRoutes);


app.listen(3000, () => console.log("Server running on port 3000"));
// index.js




const PORT = 3000;

// Start Express server
app.listen(PORT, () => {
  console.log(`🚀 Express server running on port ${PORT}`);
});

// MQTT Setup
connect('mqtt://broker.hivemq.com');

// Subscribe to topic
subscribe('kaloon/test', (message) => {
  console.log('📥 [App] Message received in index.js:', message);
});

// Publish a test message after 3 seconds
setTimeout(() => {
  publish('kaloon/test', '✅ Hello from index.js with ESM!');
}, 3000);
