// services/faceRecognitionService.js

// Patch global scope BEFORE importing face-api
import { TextEncoder, TextDecoder } from 'util';
if (typeof globalThis.TextEncoder === 'undefined') globalThis.TextEncoder = TextEncoder;
if (typeof globalThis.TextDecoder === 'undefined') globalThis.TextDecoder = TextDecoder;

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as tf from '@tensorflow/tfjs';
import * as faceapi from 'face-api/dist/face-api.esm.js';
import canvas from 'canvas';

// Setup __dirname for ES modules
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const modelPath = path.join(__dirname, '../models');
const facesPath = path.join(__dirname, '../faces');

// Monkey-patch canvas
const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

// Set backend
await tf.setBackend('cpu');
await tf.ready();
console.log('✅ TensorFlow ready with backend:', tf.getBackend());

let modelsLoaded = false;

async function loadModels() {
  if (modelsLoaded) return;
  console.log("⏳ Loading face-api models...");
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
  if (!fs.existsSync(faceFile)) {
    console.warn(`⚠️ Face file not found for user: ${userId}`);
    return { match: false, confidence: 0 };
  }

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
    console.warn("⚠️ One or both faces could not be detected.");
    return { match: false, confidence: 0 };
  }

  const distance = faceapi.euclideanDistance(
    uploadedDescriptor.descriptor,
    storedDescriptor.descriptor
  );

  return {
    match: distance < 0.6,
    confidence: Number((1 - distance).toFixed(2))
  };
}
