// controllers/authController.js

import { pool } from '../config/db.js';
import bcrypt from 'bcrypt';
import passport from 'passport';

// SIGNUP — Register a new user with name, email, password, and role
export const signup = async (req, res) => {
  const { email, password, name, role = 'resident' } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({
      success: false,
      message: 'Email, name, and password required'
    });
  }
  try {
    // Check if user exists
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }

    // Hash password and insert user
    const hash = await bcrypt.hash(password, 10);
    const insertQuery = `
      INSERT INTO users (email, password_hash, name, role)
      VALUES ($1, $2, $3, $4)
      RETURNING id, email, name, role
    `;
    const result = await pool.query(insertQuery, [email, hash, name, role]);
    return res.status(201).json({ success: true, user: result.rows[0] });
  } catch (err) {
    console.error('Signup error:', err);
    return res.status(500).json({ success: false, message: 'Signup error' });
  }
};

// LOGIN — Authenticate and create session (returns user info)
export const login = (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      return res.status(401).json({ success: false, message: info.message });
    }
    req.logIn(user, (err) => {
      if (err) return next(err);
      // Only return safe user fields
      const safeUser = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      };
      return res.json({ success: true, message: 'Logged in', user: safeUser });
    });
  })(req, res, next);
};

// LOGOUT — Ends the user session
export const logout = (req, res) => {
  req.logout(err => {
    if (err) return res.status(500).json({ success: false, message: 'Logout error' });
    return res.json({ success: true, message: 'Logged out' });
  });
};

// GET CURRENT USER — Return currently logged-in user
export const getCurrentUser = (req, res) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'No user logged in' });
  }
  const { id, email, name, role } = req.user;
  return res.json({ success: true, user: { id, email, name, role } });
};
