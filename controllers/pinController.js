import { pool } from '../config/db.js';

export const updateGlobalPin = async (req, res) => {
  const { oldPin, newPin } = req.body;
  const userId = req.user.id; // assuming JWT middleware sets this

  if (!oldPin || !newPin) {
    return res.status(400).json({ success: false, message: 'Both oldPin and newPin are required' });
  }

  if (newPin.length < 4) {
    return res.status(400).json({ success: false, message: 'New PIN must be at least 4 digits' });
  }

  try {
    // Fetch current PIN from global_pin table
    const result = await pool.query('SELECT pin FROM global_pin ORDER BY updated_at DESC LIMIT 1');

    if (result.rowCount === 0) {
      return res.status(400).json({ success: false, message: 'No existing PIN set' });
    }

    const currentPin = result.rows[0].pin;

    // Compare oldPin directly
    if (oldPin !== currentPin) {
      return res.status(401).json({ success: false, message: 'Old PIN is incorrect' });
    }

    // Update global PIN record (insert or update)
    await pool.query(`
      INSERT INTO global_pin (updated_by, pin, updated_at)
      VALUES ($1, $2, CURRENT_TIMESTAMP)
      ON CONFLICT (id) DO UPDATE
      SET pin = EXCLUDED.pin, updated_by = EXCLUDED.updated_by, updated_at = EXCLUDED.updated_at
    `, [userId, newPin]);

    return res.json({ success: true, message: 'Global PIN updated successfully' });
  } catch (err) {
    console.error('Error updating PIN:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
