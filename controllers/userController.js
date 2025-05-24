import path from 'path';
import { pool } from '../config/db.js';

const MICRO_SERVICE_BASE_URL = process.env.FACE_SERVICE_URL || 'http://172.16.0.100:5001';

// Get all users (admin use)
export const getAllUsers = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        users.id, users.name, users.email, users.role, 
        face_dataset.image_path
      FROM users
      LEFT JOIN face_dataset ON users.id = face_dataset.user_id
    `);

    const users = result.rows.map(user => {
      let photo_url = null;
      if (user.image_path) {
        const urlPath = user.image_path.replace(/\\/g, '/');
        photo_url = `${MICRO_SERVICE_BASE_URL}/${urlPath}`;
      }
      return {
        ...user,
        photo_url
      };
    });

    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database error', error: err.message });
  }
};

// Get only pending users (for admin approval)
export const getPendingUsers = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        users.id, users.name, users.email, users.role, 
        face_dataset.image_path
      FROM users
      LEFT JOIN face_dataset ON users.id = face_dataset.user_id
      WHERE users.role = 'pending'
    `);

    const users = result.rows.map(user => {
      let photo_url = null;
      if (user.image_path) {
        const urlPath = user.image_path.replace(/\\/g, '/');
        photo_url = `${MICRO_SERVICE_BASE_URL}/${urlPath}`;
      }
      return {
        ...user,
        photo_url
      };
    });

    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database error', error: err.message });
  }
};
