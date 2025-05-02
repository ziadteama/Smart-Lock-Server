// services/notificationService.js

import { pool } from '../config/db.js';

export const logToDb = async (userId, message, type = 'log', severity = 'info') => {
  await pool.query(
    `INSERT INTO notifications (user_id, message, type, severity) VALUES ($1, $2, $3, $4)`,
    [userId, message, type, severity]
  );
};
