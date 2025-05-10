import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';
import FormData from 'form-data';
import { pool } from '../config/db.js';
import * as notificationService from '../services/notificationService.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const facesDir = path.join(__dirname, '../faces');
const PYTHON_MICROSERVICE_URL = 'http://localhost:5001'; // Adjust as needed

if (!fs.existsSync(facesDir)) fs.mkdirSync(facesDir);

export const registerFace = async (req, res) => {
  const { userId } = req.body;
  const imageFile = req.file; // Multer must be used in the route middleware

  const tempPath = path.join(facesDir, `${userId}.jpg`);
  fs.writeFileSync(tempPath, imageFile.buffer);

  const formData = new FormData();
  formData.append('name', userId);
  formData.append('image', fs.createReadStream(tempPath), {
    filename: `${userId}.jpg`,
    contentType: imageFile.mimetype,
  });

  const response = await fetch(`${PYTHON_MICROSERVICE_URL}/register-face`, {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    return res.status(response.status).json({ error: data.error || 'Face registration failed' });
  }

  await pool.query(
    `INSERT INTO face_dataset (user_id, image_path)
     VALUES ($1, $2)
     ON CONFLICT (user_id)
     DO UPDATE SET image_path = $2, last_updated = CURRENT_TIMESTAMP`,
    [userId, tempPath]
  );

  await notificationService.logToDb(userId, 'Face registered', 'system');
  res.status(200).json({ message: "Face registered" });
};

export const verifyFace = async (req, res) => {
  const { userId } = req.body;
  const imageFile = req.file;

  const tempPath = path.join(facesDir, `verify-${userId}.jpg`);
  fs.writeFileSync(tempPath, imageFile.buffer);

  const formData = new FormData();
  formData.append('image', fs.createReadStream(tempPath), {
    filename: `verify-${userId}.jpg`,
    contentType: imageFile.mimetype,
  });

  const response = await fetch(`${PYTHON_MICROSERVICE_URL}/verify-face`, {
    method: 'POST',
    body: formData,
  });

  const result = await response.json();

  if (response.ok && result.match && result.user === userId) {
    await notificationService.logToDb(userId, 'Face verified (match)', 'log');
    return res.status(200).json({ verified: true });
  } else {
    await notificationService.logToDb(userId, 'Face mismatch', 'alert');
    return res.status(401).json({ verified: false });
  }
};

export const deleteFace = async (req, res) => {
  const { userId } = req.params;

  const response = await fetch(`${PYTHON_MICROSERVICE_URL}/face/${userId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    return res.status(response.status).json({ error: 'Failed to delete face in microservice' });
  }

  const facePath = path.join(facesDir, `${userId}.jpg`);
  if (fs.existsSync(facePath)) fs.unlinkSync(facePath);

  await pool.query(`DELETE FROM face_dataset WHERE user_id = $1`, [userId]);
  await notificationService.logToDb(userId, 'Face deleted', 'system');
  res.status(200).json({ message: "Face deleted" });
};
