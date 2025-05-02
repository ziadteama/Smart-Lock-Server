// controllers/pinController.js

import bcrypt from 'bcrypt';
import * as notificationService from '../services/notificationService.js';

const pinStore = new Map(); // Simulated DB: key = userId, value = hashed PIN

export const setPin = async (req, res) => {
  const { userId, pin } = req.body;
  const hashedPin = await bcrypt.hash(pin, 10);
  pinStore.set(userId, hashedPin);
  await notificationService.logEvent(userId, 'PIN set');
  res.status(200).json({ message: "PIN set successfully" });
};

export const verifyPin = async (req, res) => {
  const { userId, pin } = req.body;
  const storedHash = pinStore.get(userId);

  if (!storedHash) {
    await notificationService.logEvent(userId, 'PIN not found');
    return res.status(404).json({ error: 'PIN not set' });
  }

  const match = await bcrypt.compare(pin, storedHash);
  if (match) {
    await notificationService.logEvent(userId, 'PIN verified');
    res.status(200).json({ verified: true });
  } else {
    await notificationService.logEvent(userId, 'Invalid PIN attempt');
    res.status(401).json({ verified: false });
  }
};

export const updatePin = async (req, res) => {
  const { userId, newPin } = req.body;
  const hashed = await bcrypt.hash(newPin, 10);
  pinStore.set(userId, hashed);
  await notificationService.logEvent(userId, 'PIN updated');
  res.status(200).json({ message: "PIN updated" });
};

export const deletePin = async (req, res) => {
  const { userId } = req.body;
  pinStore.delete(userId);
  await notificationService.logEvent(userId, 'PIN deleted');
  res.status(200).json({ message: "PIN deleted" });
};
