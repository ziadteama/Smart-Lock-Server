// controllers/pinController.js

import bcrypt from 'bcrypt';
import { pool } from '../config/db.js';
import * as notificationService from '../services/notificationService.js';

export const setPin = async (req, res) => {
  const { userId, pin } = req.body;
  const hash = await bcrypt.hash(pin, 10);
  await pool.query(
    `INSERT INTO pin_updates (user_id, new_pin_hash) VALUES ($1, $2)`,
    [userId, hash]
  );
  await notificationService.logToDb(userId, 'PIN set', 'system');
  res.status(200).json({ message: "PIN set successfully" });
};

export const verifyPin = async (req, res) => {
  const { userId, pin } = req.body;
  const result = await pool.query(
    `SELECT new_pin_hash FROM pin_updates WHERE user_id = $1 ORDER BY timestamp DESC LIMIT 1`,
    [userId]
  );

  if (result.rowCount === 0) {
    await notificationService.logToDb(userId, 'PIN verification failed — no PIN set', 'alert');
    return res.status(404).json({ verified: false });
  }

  const match = await bcrypt.compare(pin, result.rows[0].new_pin_hash);
  const message = match ? 'PIN verified' : 'Invalid PIN attempt';
  const type = match ? 'log' : 'alert';
  await notificationService.logToDb(userId, message, type);
  res.status(match ? 200 : 401).json({ verified: match });
};

export const updatePin = async (req, res) => {
  const { userId, newPin } = req.body;
  const hash = await bcrypt.hash(newPin, 10);
  await pool.query(
    `INSERT INTO pin_updates (user_id, new_pin_hash) VALUES ($1, $2)`,
    [userId, hash]
  );
  await notificationService.logToDb(userId, 'PIN updated', 'system');
  res.status(200).json({ message: "PIN updated" });
};

export const deletePin = async (req, res) => {
  const { userId } = req.body;
  await pool.query(`DELETE FROM pin_updates WHERE user_id = $1`, [userId]);
  await notificationService.logToDb(userId, 'PIN deleted', 'system');
  res.status(200).json({ message: "PIN deleted" });
};
