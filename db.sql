-- Enable UUID generator
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. USERS TABLE
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(10) CHECK (role IN ('admin', 'resident')) DEFAULT 'resident',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. ACCESS LOGS TABLE
CREATE TABLE access_logs (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    method VARCHAR(20) NOT NULL, -- e.g., 'keypad', 'remote', 'manual', 'unknown'
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    image_path TEXT,
    matched_name VARCHAR(100),
    confidence FLOAT
);

-- 3. FACE DATASET TABLE
CREATE TABLE face_dataset (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    image_path TEXT NOT NULL,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. PIN UPDATES TABLE
CREATE TABLE pin_updates (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    new_pin_hash TEXT NOT NULL
);

-- 5. NOTIFICATIONS TABLE
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    message TEXT NOT NULL,
    type VARCHAR(20) CHECK (type IN ('log', 'alert', 'system', 'reminder')) DEFAULT 'log',
    severity VARCHAR(10) CHECK (severity IN ('info', 'warning', 'critical')) DEFAULT 'info',
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'sent'
);
