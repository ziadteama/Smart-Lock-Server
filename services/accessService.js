import fs from 'fs';
import path from 'path';
import { pool } from '../config/db.js';
import { logToDb } from './notificationService.js';

/**
 * Save access image and log access to DB
 * @param {object} param0
 * @param {string|null} param0.userId
 * @param {string} param0.result
 * @param {Buffer} param0.imageBuffer
 */
export async function sendPhotoNotification(userId, message, imageBuffer) {
  const timestamp = new Date().toISOString();
  const logDir = path.join(process.cwd(), 'logs');

  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  const filename = `${timestamp}-${userId || 'unknown'}.jpg`;
  const filePath = path.join(logDir, filename);
  fs.writeFileSync(filePath, imageBuffer);

  await pool.query(
    `INSERT INTO access_logs (user_id, result, image_path, timestamp)
     VALUES ($1, $2, $3, $4)`,
    [userId, message, filename, timestamp]
  );

  await logToDb(userId, message, message === 'match' ? 'log' : 'alert');

  console.log(`📤 [HTTP] Logged photo notification for ${userId || 'unknown'} | ${message}`);
}

/**
 * Log a generic access event
 * @param {object|string} data - Event message or object
 */
export async function logAccessEvent(data) {
  const payload = typeof data === 'string' ? { message: data } : data;
  const { userId = null, message = 'Unknown event' } = payload;

  await pool.query(
    `INSERT INTO access_logs (user_id, result, image_path, timestamp)
     VALUES ($1, $2, $3, CURRENT_TIMESTAMP)`,
    [userId, message, 'none']
  );

  await logToDb(userId, message, 'log');
  console.log(`📥 [HTTP] Logged access event: ${message}`);
}

/**
 * Simulate door unlock
 */
export function unlockDoor() {
  console.log('🔓 [HTTP] Door unlocked (simulated)');
}

/**
 * Simulate door lock
 */
export function lockDoor() {
  console.log('🔒 [HTTP] Door locked (simulated)');
}

/**
 * Send generic message to the frontend
 * @param {string} message
 */
export async function sendNotification(message) {
  console.log(`📢 [HTTP] Sending frontend notification: ${message}`);
  await pool.query(
    `INSERT INTO access_status (user_id, status, timestamp)
     VALUES ($1, $2, CURRENT_TIMESTAMP)`,
    [null, message]
  );
}
