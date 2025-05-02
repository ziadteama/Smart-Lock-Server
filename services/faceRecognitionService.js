// services/faceRecognitionService.js

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const facesDir = path.join(__dirname, '../faces');

export const compareFace = async (userId, base64Image) => {
  const referencePath = path.join(facesDir, `${userId}.jpg`);
  if (!fs.existsSync(referencePath)) return false;

  // This is placeholder logic
  const uploadedBuffer = Buffer.from(base64Image, 'base64');
  const referenceBuffer = fs.readFileSync(referencePath);

  // Dummy check (replace with real ML model)
  return uploadedBuffer.length === referenceBuffer.length;
};
