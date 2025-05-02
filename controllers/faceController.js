// controllers/faceController.js

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const facesDir = path.join(__dirname, '../faces');

export const registerFace = async (req, res) => {
  const { userId, base64Image } = req.body;
  res.status(200).json({ message: "Face registered" });
};

export const verifyFace = async (req, res) => {
  const { userId, base64Image } = req.body;
  res.status(200).json({ verified: true });
};

export const deleteFace = async (req, res) => {
  const { userId } = req.params;
  res.status(200).json({ message: "Face data deleted" });
};
