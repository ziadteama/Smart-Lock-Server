// services/faceRecognitionService.js

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as faceapi from '@vladmandic/face-api';
import canvas from 'canvas';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const modelPath = path.join(__dirname, '../models');
const facesPath = path.join(__dirname, '../faces');

const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

let modelsLoaded = false;

async function loadModels() {
  if (modelsLoaded) return;
  await faceapi.nets.ssdMobilenetv1.loadFromDisk(modelPath);
  await faceapi.nets.faceLandmark68Net.loadFromDisk(modelPath);
  await faceapi.nets.faceRecognitionNet.loadFromDisk(modelPath);
  modelsLoaded = true;
  console.log("✅ face-api models loaded");
}

function imageFromBase64(base64String) {
  const buffer = Buffer.from(base64String, 'base64');
  const img = new Image();
  img.src = buffer;
  return img;
}

export async function compareFace(userId, base64Image) {
  await loadModels();

  const faceFile = path.join(facesPath, `${userId}.jpg`);
  if (!fs.existsSync(faceFile)) return false;

  const uploadedImage = imageFromBase64(base64Image);
  const storedImage = await canvas.loadImage(faceFile);

  const uploadedDescriptor = await faceapi
    .detectSingleFace(uploadedImage)
    .withFaceLandmarks()
    .withFaceDescriptor();

  const storedDescriptor = await faceapi
    .detectSingleFace(storedImage)
    .withFaceLandmarks()
    .withFaceDescriptor();

  if (!uploadedDescriptor || !storedDescriptor) {
    return { match: false, confidence: 0 };
  }

  const distance = faceapi.euclideanDistance(
    uploadedDescriptor.descriptor,
    storedDescriptor.descriptor
  );

  return {
    match: distance < 0.6,
    confidence: (1 - distance).toFixed(2)
  };
}
