// controllers/faceController.js

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from '../config/db.js';
import * as faceRecognitionService from '../services/faceRecognitionService.js';
import * as notificationService from '../services/notificationService.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const facesDir = path.join(__dirname, '../faces');

if (!fs.existsSync(facesDir)) fs.mkdirSync(facesDir);

export const registerFace = async (req, res) => {
  const { userId, base64Image } = req.body;
  const buffer = Buffer.from(base64Image, 'base64');
  const filePath = path.join(facesDir, `${userId}.jpg`);
  fs.writeFileSync(filePath, buffer);

  await pool.query(
    `INSERT INTO face_dataset (user_id, image_path)
     VALUES ($1, $2)
     ON CONFLICT (user_id)
     DO UPDATE SET image_path = $2, last_updated = CURRENT_TIMESTAMP`,
    [userId, filePath]
  );

  await notificationService.logToDb(userId, 'Face registered', 'system');
  res.status(200).json({ message: "Face registered" });
};

export const verifyFace = async (req, res) => {
  const { userId, base64Image } = req.body;
  const isMatch = await faceRecognitionService.compareFace(userId, base64Image);

  const message = isMatch ? 'Face verified' : 'Face mismatch';
  const type = isMatch ? 'log' : 'alert';
  await notificationService.logToDb(userId, message, type);

  res.status(isMatch ? 200 : 401).json({ verified: isMatch });
};

export const deleteFace = async (req, res) => {
  const { userId } = req.params;
  const facePath = path.join(facesDir, `${userId}.jpg`);

  if (fs.existsSync(facePath)) fs.unlinkSync(facePath);

  await pool.query(`DELETE FROM face_dataset WHERE user_id = $1`, [userId]);
  await notificationService.logToDb(userId, 'Face deleted', 'system');
  res.status(200).json({ message: "Face deleted" });
};
