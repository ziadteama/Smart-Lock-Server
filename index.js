// index.js

import express from 'express';
import cors from 'cors';
import os from 'os';
import path from 'path';
import { pool } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import faceRoutes from './routes/faceRoutes.js';
import userRoutes from './routes/userRoutes.js';

const app = express();
const PORT = 3000;
const HOST = '0.0.0.0'; // Listen on all interfaces (LAN)

// ====== FUNCTION TO GET LOCAL NETWORK IP ======
function getLocalIp() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

// ====== DYNAMIC CORS CONFIGURATION FOR SUBNET ======
// Accept any frontend from 172.20.8.x - 172.20.11.x (255.255.252.0 subnet)
function isAllowedSubnet(origin) {
  try {
    const { hostname } = new URL(origin);
    const parts = hostname.split('.').map(Number);
    // Check 172.20.8.x to 172.20.11.x
    return (
      parts[0] === 172 &&
      parts[1] === 20 &&
      parts[2] >= 8 &&
      parts[2] <= 11 &&
      parts[3] >= 0 &&
      parts[3] <= 255
    );
  } catch (e) {
    return false;
  }
}

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // Allow non-browser requests (Postman, curl)
    if (isAllowedSubnet(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS: ' + origin));
    }
  },
  credentials: true
}));

// ====== BODY PARSER ======
app.use(express.json());

// ====== SERVE FACE IMAGES STATICALLY ======
app.use('/faces', express.static(path.join(process.cwd(), 'known_faces')));

// ====== ROUTES ======
app.use('/api/auth', authRoutes);
app.use('/api/face', faceRoutes);
app.use('/api/users', userRoutes);

// Health check/test route
app.get('/', (req, res) => res.send('API is running!'));

// ====== START SERVER ======
app.listen(PORT, HOST, () => {
  const localIp = getLocalIp();
  console.log(`Server is running on http://${HOST}:${PORT}`);
  console.log(`Accessible locally at: http://localhost:${PORT}/`);
  console.log(`Accessible on your LAN at: http://${localIp}:${PORT}/`);
  console.log('CORS is enabled for all in subnet 172.20.8.x to 172.20.11.x');
  console.log('Face images served from /faces/');
});
