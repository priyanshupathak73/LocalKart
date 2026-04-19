ALTER TABLE users ADD COLUMN phone_number TEXT;
CREATE INDEX IF NOT EXISTS idx_users_phone_number ON users(phone_number);
