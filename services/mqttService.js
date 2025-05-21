// services/mqttService.js
import mqtt from 'mqtt';

let client = null;

export function connect(brokerUrl, options = {}) {
  console.log('🟡 [MQTT] Connecting to:', brokerUrl);
  client = mqtt.connect(brokerUrl, options);

  client.on('connect', () => {
    console.log('✅ [MQTT] Connected to broker');
  });

  client.on('error', (err) => {
    console.error('❌ [MQTT] Error:', err);
  });

  client.on('close', () => {
    console.warn('🔌 [MQTT] Connection closed');
  });
}

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
      console.log(`📡 [MQTT] Subscribed: ${topic}`);
    }
  });

  client.on('message', (recvTopic, message) => {
    console.log(`📥 [MQTT] Message on ${recvTopic}: ${message.toString()}`);
    if (recvTopic === topic) {
      callback(message.toString(), recvTopic);
    }
  });
}

export function publish(topic, message) {
  if (!client) {
    console.error('❗ [MQTT] publish() - client not connected');
    return;
  }

  console.log(`🟡 [MQTT] Publishing to ${topic}: ${message}`);

  client.publish(topic, message, (err) => {
    if (err) {
      console.error(`❌ [MQTT] Failed to publish: ${topic}`, err);
    } else {
      console.log(`📤 [MQTT] Published: ${message}`);
    }
  });
}

// ✅ Smart Lock MQTT Commands
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
