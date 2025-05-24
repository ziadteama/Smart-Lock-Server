import mqtt from 'mqtt';

let client = null;

/**
 * Connect to the MQTT broker.
 * @param {string} brokerUrl - The MQTT broker URL (e.g., 'mqtt://localhost:1883')
 * @param {object} options - Optional MQTT connection options
 */
export function connect(brokerUrl, options = {}) {
  console.log('🟡 [MQTT] Connecting to:', brokerUrl);
  client = mqtt.connect(brokerUrl, options);

  client.on('connect', () => {
    console.log('✅ [MQTT] Connected to broker');
  });

  client.on('reconnect', () => {
    console.log('♻️ [MQTT] Reconnecting to broker...');
  });

  client.on('error', (err) => {
    console.error('❌ [MQTT] Error:', err);
  });

  client.on('close', () => {
    console.warn('🔌 [MQTT] Connection closed');
  });

  client.on('offline', () => {
    console.warn('⚠️ [MQTT] Client offline');
  });
}

/**
 * Subscribe to a topic.
 * @param {string} topic - The topic to subscribe to
 * @param {function} callback - Callback to invoke when a message arrives
 */
export function subscribe(topic, callback) {
  if (!client) {
    console.error('❗ [MQTT] subscribe() - client not connected');
    return;
  }

  console.log(`🟡 [MQTT] Subscribing to topic: ${topic}`);

  client.subscribe(topic, (err) => {
    if (err) {
      console.error(`❌ [MQTT] Failed to subscribe: ${topic}`, err);
    } else {
      console.log(`📡 [MQTT] Successfully subscribed: ${topic}`);
    }
  });

  client.on('message', (recvTopic, message) => {
    if (recvTopic === topic) {
      console.log(`📥 [MQTT] Message received on topic "${recvTopic}": ${message.toString().slice(0, 100)}${message.length > 100 ? '...' : ''}`);
      callback(message.toString(), recvTopic);
    }
  });
}

/**
 * Publish a message to a topic.
 * @param {string} topic - The topic to publish to
 * @param {string} message - The message to publish
 */
export function publish(topic, message) {
  if (!client) {
    console.error('❗ [MQTT] publish() - client not connected');
    return;
  }

  console.log(`🟡 [MQTT] Publishing to ${topic}`);

  client.publish(topic, message, (err) => {
    if (err) {
      console.error(`❌ [MQTT] Failed to publish to ${topic}`, err);
    } else {
      console.log(`📤 [MQTT] Successfully published message to: ${topic}`);
    }
  });
}

/**
 * Send a photo (image buffer) encoded as base64 string over MQTT.
 * @param {string} topic - The MQTT topic to publish the photo to
 * @param {Buffer} imageBuffer - The image data buffer
 */
export function sendPhoto(topic, imageBuffer) {
  if (!client) {
    console.error('❗ [MQTT] sendPhoto() - client not connected');
    return;
  }

  const base64Image = imageBuffer.toString('base64');
  console.log(`🟡 [MQTT] Sending photo to topic: ${topic} (base64 length: ${base64Image.length})`);
  client.publish(topic, base64Image, (err) => {
    if (err) {
      console.error(`❌ [MQTT] Failed to publish photo to: ${topic}`, err);
    } else {
      console.log(`📤 [MQTT] Published photo (base64) to: ${topic}`);
    }
  });
}

/**
 * Send a JSON notification message with an embedded photo as base64 string.
 * @param {string} userId - User ID related to the notification
 * @param {string} message - Notification message
 * @param {Buffer} imageBuffer - The image buffer to include as base64
 */
export function sendPhotoNotification(userId, message, imageBuffer) {
  if (!client) {
    console.error('❗ [MQTT] sendPhotoNotification() - client not connected');
    return;
  }

  const payload = {
    userId,
    message,
    photoBase64: imageBuffer.toString('base64'),
    timestamp: new Date().toISOString(),
  };

  console.log(`🟡 [MQTT] Sending photo notification for userId: ${userId} with message: "${message}"`);

  client.publish('lock/notify/photo', JSON.stringify(payload), (err) => {
    if (err) {
      console.error('❌ [MQTT] Failed to publish photo notification', err);
    } else {
      console.log('📤 [MQTT] Published photo notification');
    }
  });
}

// ======= Existing Smart Lock MQTT commands =======

export function unlockDoor() {
  publish('lock/command/unlock', 'unlock');
}

export function lockDoor() {
  publish('lock/command/lock', 'lock');
}

export function sendNotification(message) {
  publish('lock/notify', message);
}

export function logAccessEvent(data) {
  const payload = typeof data === 'string' ? data : JSON.stringify(data);
  publish('lock/log/access', payload);
}
