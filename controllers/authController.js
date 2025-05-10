import bcrypt from 'bcrypt';
import { pool } from '../config/db.js';

export const login = (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    if (!user) return res.status(401).json({ success: false, message: info.message });

    req.logIn(user, (err) => {
      if (err) return next(err);
      return res.json({ 
        success: true, 
        user: { 
          id: user.id, 
          email: user.email,
          role: user.role
        } 
      });
    });
  })(req, res, next);
};

export const logout = (req, res) => {
  req.logout();
  res.json({ success: true, message: 'Logged out' });
};

export const signup = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Check if user exists
    const userExists = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    if (userExists.rows[0]) {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }

    // 2. Hash password and create user
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await pool.query(
      `INSERT INTO users (email, password_hash) 
       VALUES ($1, $2) 
       RETURNING id, email, role, created_at`,
      [email, hashedPassword]
    );

    res.status(201).json({ success: true, user: newUser.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getCurrentUser = (req, res) => {
  if (!req.user) return res.status(401).json({ success: false, message: 'Not authenticated' });
  res.json({ 
    success: true, 
    user: {
      id: req.user.id,
      email: req.user.email,
      role: req.user.role
    }
  });
};