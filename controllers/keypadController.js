// controllers/keypadController.js

import bcrypt from 'bcrypt';
import { pool } from '../config/db.js';
import * as notificationService from '../services/notificationService.js';

export const verifyPinFromKeypad = async (req, res) => {
  const { pin } = req.body;

  const result = await pool.query(`
    SELECT * FROM global_pin
    ORDER BY updated_at DESC
    LIMIT 1
  `);

  if (result.rowCount === 0) {
    return res.status(404).json({ error: 'No global PIN set' });
  }

  const { updated_by, pin_hash } = result.rows[0];
  const match = await bcrypt.compare(pin, pin_hash);

  if (match) {
    await pool.query(`
      INSERT INTO access_logs (user_id, method) VALUES ($1, 'keypad')
    `, [updated_by]);

    await notificationService.logToDb(updated_by, 'Access granted via global PIN', 'log');
    return res.status(200).json({ access: true, userId: updated_by });
  } else {
    await notificationService.logToDb(null, 'Failed global PIN attempt', 'alert', 'warning');
    return res.status(401).json({ access: false });
  }
};
