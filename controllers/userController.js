import path from 'path';
import { pool } from '../config/db.js';

const MICRO_SERVICE_BASE_URL = process.env.FACE_SERVICE_URL || 'http://172.16.0.100:5001';

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
        // Replace backslashes with forward slashes for URLs
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
