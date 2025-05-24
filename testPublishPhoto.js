import fetch from 'node-fetch';

// Replace with your ESP32 device IP address
const ESP_IP = 'http://192.168.146.128'; // change to your ESP32 IP

async function sendLockCommand(lock) {
  const url = lock ? `${ESP_IP}/lock` : `${ESP_IP}/unlock`;
  console.log(`Sending ${lock ? 'lock' : 'unlock'} command to ${url}`);

  try {
    const response = await fetch(url);
    if (response.ok) {
      console.log(`${lock ? 'Lock' : 'Unlock'} command succeeded`);
      const text = await response.text();
      console.log('Response:', text);
    } else {
      console.error(`Failed to ${lock ? 'lock' : 'unlock'} door, status: ${response.status}`);
    }
  } catch (err) {
    console.error('Error sending lock command:', err);
  }
}

// Call the function to test locking or unlocking
sendLockCommand(false); // unlock the door
// sendLockCommand(true); // lock the door
