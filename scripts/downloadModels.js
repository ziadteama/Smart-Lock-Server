// scripts/downloadModels.js

import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const modelDir = path.join(__dirname, '../models');

const baseUrl = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js-models/master/weights';

const files = [
  'face_recognition_model-shard1',
  'face_recognition_model-weights_manifest.json',
  'face_landmark_68_model-shard1',
  'face_landmark_68_model-weights_manifest.json',
  'ssd_mobilenetv1_model-shard1',
  'ssd_mobilenetv1_model-weights_manifest.json'
];

if (!fs.existsSync(modelDir)) {
  fs.mkdirSync(modelDir, { recursive: true });
}

function downloadFile(file) {
  const filePath = path.join(modelDir, file);
  const url = `${baseUrl}/${file}`;
  return new Promise((resolve, reject) => {
    const stream = fs.createWriteStream(filePath);
    https.get(url, response => {
      if (response.statusCode !== 200) {
        reject(`❌ Failed to download ${file}: ${response.statusCode}`);
        return;
      }
      response.pipe(stream);
      stream.on('finish', () => {
        stream.close();
        console.log(`✅ Downloaded: ${file}`);
        resolve();
      });
    }).on('error', err => {
      fs.unlink(filePath, () => {});
      reject(`❌ Error downloading ${file}: ${err.message}`);
    });
  });
}

(async () => {
  console.log('📦 Downloading face-api.js models...');
  for (const file of files) {
    try {
      await downloadFile(file);
    } catch (err) {
      console.error(err);
    }
  }
  console.log('✅ All models downloaded to /models');
})();
