// controllers/keypadController.js

import bcrypt from 'bcrypt';
import { pool } from '../config/db.js';
import * as notificationService from '../services/notificationService.js';

export const verifyPinFromKeypad = async (req, res) => {
  const { pin } = req.body;

  const result = await pool.query(`
    SELECT DISTINCT ON (user_id) user_id, new_pin_hash
    FROM pin_updates
    ORDER BY user_id, timestamp DESC
  `);

  for (const row of result.rows) {
    const match = await bcrypt.compare(pin, row.new_pin_hash);
    if (match) {
      const userId = row.user_id;

      // Optional: log access
      await pool.query(`
        INSERT INTO access_logs (user_id, method)
        VALUES ($1, 'keypad')
      `, [userId]);

      await notificationService.logToDb(userId, 'Access granted via keypad', 'log');

      return res.status(200).json({ access: true, userId });
    }
  }

  await notificationService.logToDb(null, 'Invalid PIN attempt at keypad', 'alert', 'warning');
  return res.status(401).json({ access: false });
};
