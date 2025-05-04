// index.js


import express from 'express';
import pinRoutes from './routes/pinRoutes.js';
import faceRoutes from './routes/faceRoutes.js';
import keypadRoutes from './routes/keypadRoutes.js';

const app = express();
app.use(express.json());

app.use('/api/pin', pinRoutes);
app.use('/api/face', faceRoutes);
app.use('/api/keypad', keypadRoutes);

app.listen(3000, () => console.log("🚀 Server running on port 3000"));
