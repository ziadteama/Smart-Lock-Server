import { pool } from '../config/db.js';

export const getAccessLogs = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        users.name as matched_name,
        access_logs.method,
        access_logs.timestamp
      FROM access_logs
      LEFT JOIN users ON access_logs.user_id = users.id
      ORDER BY access_logs.timestamp DESC
      LIMIT 50
    `);

    // Only send fields you want
    const logs = result.rows.map(({ matched_name, method, timestamp }) => ({
      matched_name,
      method,
      timestamp,
    }));

    res.json({ success: true, logs });
  } catch (error) {
    console.error('Error fetching access logs:', error);
    res.status(500).json({ success: false, message: 'Database error' });
  }
};
