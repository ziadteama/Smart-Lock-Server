// index.js

import express from 'express';
import session from 'express-session';
import pgSession from 'connect-pg-simple';
import passport from 'passport';
import { pool } from './config/db.js';
import './config/passport.js';
import authRoutes from './routes/authRoutes.js';

const app = express();
const PORT = 3000;
const HOST = '0.0.0.0'; // Listen on all network interfaces (LAN accessible)
const LOCAL_IP = '172.16.0.252'; // Your actual local IP

// Parse incoming JSON requests
app.use(express.json());

// Persistent session store using PostgreSQL
const PgSession = pgSession(session);

app.use(session({
  store: new PgSession({
    pool: pool,            // Use your existing pg Pool
    tableName: 'session',  // Table name (will auto-create if missing)
  }),
  secret: 'your-session-secret',      // Change in production!
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,                    // True only for HTTPS in production
    maxAge: 7 * 24 * 60 * 60 * 1000   // 7 days (change as you like)
  }
}));

// Initialize Passport and session
app.use(passport.initialize());
app.use(passport.session());

// Mount your authentication routes
app.use('/api/auth', authRoutes);

// Health check/test route
app.get('/', (req, res) => res.send('API is running!'));

// Start server, listen on all network interfaces
app.listen(PORT, HOST, () => {
  console.log(`Server is running on http://${HOST}:${PORT}`);
  console.log(`Accessible locally at: http://localhost:${PORT}/`);
  console.log(`Accessible on your LAN at: http://${LOCAL_IP}:${PORT}/`);
});
