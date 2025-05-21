// controllers/pinController.js

import bcrypt from "bcrypt";
import { pool } from "../config/db.js";

import * as notificationService from "../services/notificationService.js";

export const setPin = async (req, res) => {
  const { userId, pin } = req.body;

  // ✅ Check if user is an admin
  const userResult = await pool.query(`SELECT role FROM users WHERE id = $1`, [
    userId,
  ]);

  if (userResult.rowCount === 0) {
    return res.status(404).json({ error: "User not found" });
  }

  const { role } = userResult.rows[0];
  if (role !== "admin") {
    await notificationService.logToDb(
      userId,
      "Unauthorized PIN update attempt",
      "alert",
      "critical"
    );
    return res
      .status(403)
      .json({ error: "Only admins can set the global PIN" });
  }

  const hash = await bcrypt.hash(pin, 10);
  await pool.query(`DELETE FROM global_pin`);
  await pool.query(
    `INSERT INTO global_pin (updated_by, pin_hash) VALUES ($1, $2)`,
    [userId, hash]
  );

  await notificationService.logToDb(userId, "Global PIN updated", "system");
  res.status(200).json({ message: "Global PIN set successfully" });
};

export const updatePin = setPin; // Same logic — overwrite old one

export const deletePin = async (req, res) => {
  await pool.query(`DELETE FROM global_pin`);
  await notificationService.logToDb(null, "Global PIN deleted", "system");
  res.status(200).json({ message: "Global PIN deleted" });
};

export const verifyPin = async (req, res) => {
  const { pin } = req.body;
  const result = await pool.query(
    `SELECT * FROM global_pin ORDER BY updated_at DESC LIMIT 1`
  );

  if (result.rowCount === 0) {
    return res.status(404).json({ error: "No global PIN is set" });
  }

  const { updated_by, pin_hash } = result.rows[0];
  const match = await bcrypt.compare(pin, pin_hash);

  if (match) {
    await notificationService.logToDb(updated_by, "Global PIN verified", "log");
    res.status(200).json({ verified: true, userId: updated_by });
  } else {
    await notificationService.logToDb(
      null,
      "Invalid global PIN attempt",
      "alert",
      "warning"
    );
    res.status(401).json({ verified: false });
  }
};
