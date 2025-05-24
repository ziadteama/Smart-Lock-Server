import mqtt from 'mqtt';
import fs from 'fs';
import path from 'path';

// MQTT broker URL (replace with your IP if needed)
const MQTT_BROKER_URL = 'mqtt://192.168.146.51:3000'; 

// Connect to broker
const client = mqtt.connect(MQTT_BROKER_URL);

client.on('connect', () => {
  console.log('✅ Connected to MQTT broker');

  // Read image file
  const imagePath = path.resolve('test.jpg'); // Put a test.jpg file here
  if (!fs.existsSync(imagePath)) {
    console.error('Test image not found:', imagePath);
    client.end();
    return;
  }

  const imageBuffer = fs.readFileSync(imagePath);
  const base64Image = imageBuffer.toString('base64');

  // Publish to topic (e.g., "lock/verify/photo")
  client.publish('lock/verify/photo', base64Image, (err) => {
    if (err) {
      console.error('Failed to publish photo:', err);
    } else {
      console.log('📤 Photo published successfully');
    }
    client.end();
  });
});

client.on('error', (err) => {
  console.error('MQTT Error:', err);
});
