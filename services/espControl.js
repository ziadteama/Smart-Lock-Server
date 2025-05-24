// services/espControl.js
import fetch from 'node-fetch';

const ESP_BASE_URL = 'http://192.168.146.128'; // Replace with your ESP's IP address

export async function unlockDoor() {
  try {
    const res = await fetch(`${ESP_BASE_URL}/unlock`);
    if (!res.ok) throw new Error(`Unlock request failed: ${res.statusText}`);
    console.log('Door unlocked successfully');
  } catch (error) {
    console.error('Error unlocking door:', error);
  }
}

export async function lockDoor() {
  try {
    const res = await fetch(`${ESP_BASE_URL}/lock`);
    if (!res.ok) throw new Error(`Lock request failed: ${res.statusText}`);
    console.log('Door locked successfully');
  } catch (error) {
    console.error('Error locking door:', error);
  }
}
