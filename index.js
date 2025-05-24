import express from 'express';
import cors from 'cors';
import os from 'os';
import path from 'path';

import authRoutes from './routes/authRoutes.js';
import faceRoutes from './routes/faceRoutes.js';
import userRoutes from './routes/userRoutes.js';
import pinRoutes from './routes/pinRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import espRoutes from './routes/espRoutes.js';
import accessLogRoutes from './routes/accessLogRoutes.js';

const app = express();
const PORT = 3000;
const HOST = '0.0.0.0'; // Listen on all interfaces (LAN)

// ====== Get Local Network IP ======
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

// ====== Dynamic CORS Configuration for subnet 172.20.8.x - 172.20.11.x ======
function isAllowedSubnet(origin) {
  try {
    const { hostname } = new URL(origin);
    const parts = hostname.split('.').map(Number);
    // Check 192.168.146.x
    return (
      parts[0] === 192 &&
      parts[1] === 168 &&
      parts[2] === 146 &&
      parts[3] >= 0 &&
      parts[3] <= 255
    );
  } catch (e) {
    return false;
  }
}


app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // Allow Postman, curl etc.
    if (isAllowedSubnet(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS: ' + origin));
    }
  },
  credentials: true
}));

// ====== Body parser ======
app.use(express.json());

// ====== Serve static face images ======
app.use('/faces', express.static(path.join(process.cwd(), 'known_faces')));

// ====== Mount routes ======
app.use('/api/auth', authRoutes);
app.use('/api/face', faceRoutes);
app.use('/api/users', userRoutes);
app.use('/api/pin', pinRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/esp', espRoutes);
app.use('/api/access-logs', accessLogRoutes);

// ====== Health check ======
app.get('/', (req, res) => res.send('API is running!'));

// ====== Start server ======
app.listen(PORT, HOST, () => {
  const localIp = getLocalIp();
  console.log(`Server is running on http://${HOST}:${PORT}`);
  console.log(`Accessible locally at: http://localhost:${PORT}/`);
  console.log(`Accessible on your LAN at: http://${localIp}:${PORT}/`);
  console.log('CORS is enabled for all in subnet 192.168.146.x');
  console.log('Face images served from /faces/');
});
