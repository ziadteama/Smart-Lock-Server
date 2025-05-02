// controllers/faceController.js

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as faceRecognitionService from '../services/faceRecognitionService.js';
import * as notificationService from '../services/notificationService.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const facesDir = path.join(__dirname, '../faces');

if (!fs.existsSync(facesDir)) {
  fs.mkdirSync(facesDir);
}

export const registerFace = async (req, res) => {
  const { userId, base64Image } = req.body;
  const imageBuffer = Buffer.from(base64Image, 'base64');
  const filePath = path.join(facesDir, `${userId}.jpg`);
  fs.writeFileSync(filePath, imageBuffer);
  await notificationService.logEvent(userId, 'Face registered');
  res.status(200).json({ message: "Face registered" });
};

export const verifyFace = async (req, res) => {
  const { userId, base64Image } = req.body;
  const match = await faceRecognitionService.compareFace(userId, base64Image);

  if (match) {
    await notificationService.logEvent(userId, 'Face verified');
    res.status(200).json({ verified: true });
  } else {
    await notificationService.logEvent(userId, 'Face mismatch');
    res.status(401).json({ verified: false });
  }
};

export const deleteFace = async (req, res) => {
  const { userId } = req.params;
  const filePath = path.join(facesDir, `${userId}.jpg`);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    await notificationService.logEvent(userId, 'Face deleted');
    res.status(200).json({ message: "Face deleted" });
  } else {
    res.status(404).json({ error: "No face found for user" });
  }
};
