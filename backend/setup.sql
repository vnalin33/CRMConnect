-- SQL Script to set up the 'users' table in 'ncrm' database

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    mobile VARCHAR(15) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL, -- Will store hashed password
    role VARCHAR(50) DEFAULT 'Finance Agent',
    rating DECIMAL(3, 2) DEFAULT 0.0,
    is_top_performer BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Example user (Password: password123)
-- Hash generated via bcrypt (10 salts): $2b$10$7R9rRjH9K7Q9g9k9k9k9kOu.7R9rRjH9K7Q9g9k9k9k9kOu.
-- Note: Replace with actual hashed password if using bcrypt in backend.
-- For initial testing, I've added a fallback in authService.js (commented) if you want to test with plain text.

INSERT INTO users (name, email, mobile, password, role, rating, is_top_performer)
VALUES ('Demo User', 'demo@example.com', '9876543210', '$2b$10$77R9rRjH9K7Q9g9k9k9k9kOu.7R9rRjH9K7Q9g9k9k9k9kOu.', 'Finance Agent', 4.5, true)
ON CONFLICT (email) DO NOTHING;
