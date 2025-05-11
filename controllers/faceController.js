import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';
import FormData from 'form-data';
import sharp from 'sharp';
import { pool } from '../config/db.js';
import * as notificationService from '../services/notificationService.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PYTHON_MICROSERVICE_URL = 'http://192.168.100.221:5001';

export const registerFace = async (req, res) => {
  const { userId } = req.body;
  const imageFile = req.file;

  if (!userId || !imageFile) {
    return res.status(400).json({ error: 'userId and image are required' });
  }

  const resizedBuffer = await sharp(imageFile.buffer)
    .resize({ width: 500 })
    .jpeg()
    .toBuffer();

  const formData = new FormData();
  formData.append('name', userId);
  formData.append('image', resizedBuffer, {
    filename: `${userId}.jpg`,
    contentType: 'image/jpeg',
  });

  const response = await fetch(`${PYTHON_MICROSERVICE_URL}/register-face`, {
    method: 'POST',
    body: formData,
    headers: formData.getHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    return res.status(response.status).json({ error: data.error || 'Face registration failed' });
  }

  // No need to store image path anymore — store minimal metadata
  await pool.query(
    `INSERT INTO face_dataset (user_id)
     VALUES ($1)
     ON CONFLICT (user_id)
     DO UPDATE SET last_updated = CURRENT_TIMESTAMP`,
    [userId]
  );

  await notificationService.logToDb(userId, 'Face registered', 'system');
  res.status(200).json({ message: "Face registered" });
};

export const verifyFace = async (req, res) => {
  const imageFile = req.file;

  if (!imageFile) {
    return res.status(400).json({ error: 'image is required' });
  }

  const resizedBuffer = await sharp(imageFile.buffer)
    .resize({ width: 500 })
    .jpeg()
    .toBuffer();

  const formData = new FormData();
  formData.append('image', resizedBuffer, {
    filename: `verify.jpg`,
    contentType: 'image/jpeg',
  });

  const response = await fetch(`${PYTHON_MICROSERVICE_URL}/verify-face`, {
    method: 'POST',
    body: formData,
    headers: formData.getHeaders(),
  });

  const result = await response.json();

  if (response.ok && result.match) {
    await notificationService.logToDb(result.user_id, 'Face verified (match)', 'log');
    return res.status(200).json({ verified: true, user_id: result.user_id });
  } else {
    await notificationService.logToDb('unknown', 'Face mismatch', 'alert');
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

  await pool.query(`DELETE FROM face_dataset WHERE user_id = $1`, [userId]);
  await notificationService.logToDb(userId, 'Face deleted', 'system');
  res.status(200).json({ message: "Face deleted" });
};
