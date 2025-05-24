import { lockDoor, unlockDoor } from '../services/espControl.js';

export const lock = async (req, res) => {
  try {
    await lockDoor();
    res.json({ success: true, message: 'Door locked' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const unlock = async (req, res) => {
  try {
    await unlockDoor();
    res.json({ success: true, message: 'Door unlocked' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
