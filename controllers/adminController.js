// controllers/adminController.js

import { pool } from '../config/db.js';  // add .js extension

// Promote user from pending to resident (accept)
export const acceptUser = async (req, res) => {
  const { userId } = req.params;

  try {
    const result = await pool.query(
      `UPDATE users SET role = 'resident' WHERE id = $1 AND role = 'pending'`,
      [userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'User not found or not pending' });
    }

    res.json({ success: true, message: 'User accepted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'DB error', error: err.message });
  }
};

// Reject user (delete or mark as rejected)
export const rejectUser = async (req, res) => {
  const { userId } = req.params;

  try {
    const result = await pool.query(
      `DELETE FROM users WHERE id = $1 AND role = 'pending'`,
      [userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'User not found or not pending' });
    }

    res.json({ success: true, message: 'User rejected and deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'DB error', error: err.message });
  }
};
