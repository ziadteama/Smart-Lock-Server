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
const ESP_BASE_URL = 'http://192.168.146.99'; // <-- Change to your ESP IP here

// Helper to build relative image path for static serving
function getImagePath(userId, filename) {
  return `known_faces/${userId}/${filename}`;
}

function isValidImageFile(filename) {
  const ext = path.extname(filename).toLowerCase();
  return ext === '.jpg' || ext === '.jpeg' || ext === '.png';
}

// Send unlock command to ESP32
async function unlockDoor() {
  try {
    const res = await fetch(`${ESP_BASE_URL}/unlock`);
    if (!res.ok) throw new Error(`Unlock request failed: ${res.statusText}`);
    console.log('✅ Door unlocked successfully');
  } catch (error) {
    console.error('❌ Error unlocking door:', error);
  }
}

// Send lock command to ESP32
async function lockDoor() {
  try {
    const res = await fetch(`${ESP_BASE_URL}/lock`);
    if (!res.ok) throw new Error(`Lock request failed: ${res.statusText}`);
    console.log('✅ Door locked successfully');
  } catch (error) {
    console.error('❌ Error locking door:', error);
  }
}

export const registerFace = async (req, res) => {
  const { userId } = req.body;
  const imageFile = req.file;

  if (!userId || !imageFile) {
    return res.status(400).json({ error: 'userId and image file are required' });
  }

  if (!isValidImageFile(imageFile.originalname)) {
    return res.status(400).json({ error: 'Only jpg, jpeg, and png files are allowed' });
  }

  // Resize image and convert to JPEG
  const resizedBuffer = await sharp(imageFile.buffer)
    .resize({ width: 500 })
    .jpeg()
    .toBuffer();

  const filename = `${userId}.jpg`;
  const relativeImagePath = getImagePath(userId, filename);

  const formData = new FormData();
  formData.append('name', userId);
  formData.append('image', resizedBuffer, {
    filename,
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

  await pool.query(
    `INSERT INTO face_dataset (user_id, image_path)
     VALUES ($1, $2)
     ON CONFLICT (user_id)
     DO UPDATE SET image_path = $2, last_updated = CURRENT_TIMESTAMP`,
    [userId, relativeImagePath]
  );

  await notificationService.logToDb(userId, 'Face registered', 'system');

  res.status(200).json({ message: "Face registered", image_path: relativeImagePath });
};

export const verifyFace = async (req, res) => {
  const imageFile = req.file;

  if (!imageFile) {
    console.log('⚠️ verifyFace called without image file');
    return res.status(400).json({ error: 'image file is required' });
  }

  if (!isValidImageFile(imageFile.originalname)) {
    console.log(`⚠️ verifyFace received invalid image file type: ${imageFile.originalname}`);
    return res.status(400).json({ error: 'Only jpg, jpeg, and png files are allowed' });
  }

  try {
    const resizedBuffer = await sharp(imageFile.buffer)
      .resize({ width: 500 })
      .jpeg()
      .toBuffer();

    const formData = new FormData();
    formData.append('image', resizedBuffer, {
      filename: `verify.jpg`,
      contentType: 'image/jpeg',
    });

    // Call python microservice
    const response = await fetch(`${PYTHON_MICROSERVICE_URL}/verify-face`, {
      method: 'POST',
      body: formData,
      headers: formData.getHeaders(),
    });

    const result = await response.json();

    let matchedName = null;
    let userId = null;

    if (response.ok && result.match) {
      userId = result.userId;

      // Get user name from DB
      const userRes = await pool.query('SELECT name FROM users WHERE id = $1', [userId]);
      matchedName = userRes.rowCount ? userRes.rows[0].name : null;

      // Save access log with matched user
      await pool.query(`
        INSERT INTO access_logs (user_id, method, matched_name)
        VALUES ($1, 'face_recognition', $2)
      `, [userId, matchedName]);

      await notificationService.logToDb(userId, 'Face verified (match)', 'log');

      // Respond with user info
      return res.status(200).json({ verified: true, userId, matchedName });
    } else {
      // Save access log for unknown/mismatch attempt
      await pool.query(`
        INSERT INTO access_logs (user_id, method, matched_name)
        VALUES (NULL, 'face_recognition', 'Unknown')
      `);

      await notificationService.logToDb(null, 'Face mismatch', 'alert');
      await sendPhotoNotification(null, 'Unauthorized access attempt', resizedBuffer);

      return res.status(401).json({ verified: false });
    }
  } catch (err) {
    console.error('❌ Error during face verification:', err);
    return res.status(500).json({ error: 'Internal server error during face verification' });
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
