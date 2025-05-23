import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { pool } from './db.js';
import bcrypt from 'bcrypt';

passport.use(
  new LocalStrategy(
    { usernameField: 'email' },
    async (email, password, done) => {
      try {
        // 1. Find user by email
        const userQuery = await pool.query(
          'SELECT * FROM users WHERE email = $1',
          [email]
        );
        const user = userQuery.rows[0];

        if (!user) {
          return done(null, false, { message: 'Invalid credentials' });
        }

        // 2. Validate password
        const isValidPassword = await bcrypt.compare(password, user.password_hash);
        if (!isValidPassword) {
          return done(null, false, { message: 'Invalid credentials' });
        }

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

// Serialize/Deserialize user
passport.serializeUser((user, done) => done(null, user.id));

passport.deserializeUser(async (id, done) => {
  try {
    console.log('Deserializing user with ID:', id);  // <--- add this
    const userQuery = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    if (userQuery.rows.length === 0) {
      console.log('No user found!');
      return done(null, false);  // Not found
    }
    done(null, userQuery.rows[0]);
  } catch (err) {
    done(err);
  }
});
