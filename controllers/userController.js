// controllers/userController.js

import { pool } from '../config/db.js';

// Change this to your backend IP or use process.env for production!
const BASE_URL = 'http://172.16.0.100:3000';

// Middleware to check admin (reusable)
export const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Forbidden: Admins only' });
  }
  next();
};

// Get all users (for admin)
export const getAllUsers = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        users.id, users.name, users.email, users.role, 
        face_dataset.image_path
      FROM users
      LEFT JOIN face_dataset ON users.id = face_dataset.user_id
    `);

    // Build photo_url for each user
    const users = result.rows.map(user => ({
      ...user,
      photo_url: user.image_path
        ? `${BASE_URL}/faces/${user.image_path.replace('known_faces/', '')}`
        : null
    }));

    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Database error', error: err.message });
  }
};
