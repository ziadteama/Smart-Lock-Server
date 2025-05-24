// controllers/faceController.js

import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';
import FormData from 'form-data';
import sharp from 'sharp';
import { pool } from '../config/db.js';
import * as notificationService from '../services/notificationService.js';
import { sendPhotoNotification } from '../services/accessService.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PYTHON_MICROSERVICE_URL = process.env.FACE_SERVICE_URL;

// Helper to build relative image path for static serving
function getImagePath(userId, filename) {
  return `known_faces/${userId}/${filename}`;
}

export const registerFace = async (req, res) => {
  const { userId } = req.body;
  const imageFile = req.file;

  if (!userId || !imageFile) {
    return res.status(400).json({ error: 'userId and image are required' });
  }

  // Resize image and convert to JPEG
  const resizedBuffer = await sharp(imageFile.buffer)
    .resize({ width: 500 })
    .jpeg()
    .toBuffer();

  // Build filename and image path
  const filename = `${userId}.jpg`;
  const relativeImagePath = getImagePath(userId, filename);

  // Prepare form-data for Python microservice
  const formData = new FormData();
  formData.append('name', userId);
  formData.append('image', resizedBuffer, {
    filename: filename,
    contentType: 'image/jpeg',
  });

  // Send image to Python microservice for registration
  const response = await fetch(`${PYTHON_MICROSERVICE_URL}/register-face`, {
    method: 'POST',
    body: formData,
    headers: formData.getHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    return res.status(response.status).json({ error: data.error || 'Face registration failed' });
  }

  // Store image_path in the DB for this user
  await pool.query(
    `INSERT INTO face_dataset (user_id, image_path)
     VALUES ($1, $2)
     ON CONFLICT (user_id)
     DO UPDATE SET image_path = $2, last_updated = CURRENT_TIMESTAMP`,
    [userId, relativeImagePath]
  );

  await notificationService.logToDb(userId, 'Face registered', 'system');

  res.status(200).json({ 
    message: "Face registered", 
    image_path: relativeImagePath 
  });
};

export const verifyFace = async (req, res) => {
  const imageFile = req.file;

  if (!imageFile) {
    return res.status(400).json({ error: 'image is required' });
  }

  // Resize and convert image to JPEG
  const resizedBuffer = await sharp(imageFile.buffer)
    .resize({ width: 500 })
    .jpeg()
    .toBuffer();

  // Prepare form-data for verification request
  const formData = new FormData();
  formData.append('image', resizedBuffer, {
    filename: `verify.jpg`,
    contentType: 'image/jpeg',
  });

  // Call Python microservice for face verification
  const response = await fetch(`${PYTHON_MICROSERVICE_URL}/verify-face`, {
    method: 'POST',
    body: formData,
    headers: formData.getHeaders(),
  });

  const result = await response.json();

  if (response.ok && result.match) {
    await notificationService.logToDb(result.userId, 'Face verified (match)', 'log');
    return res.status(200).json({ verified: true, userId: result.userId });
  } else {
    // Log alert for mismatch
    await notificationService.logToDb(null, 'Face mismatch', 'alert');

    // Send MQTT photo notification with image to alert admin
    await sendPhotoNotification(null, 'Unauthorized access attempt', resizedBuffer);

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
