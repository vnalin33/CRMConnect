-- Migration: Add password reset columns to users table
-- Run this SQL against your PostgreSQL database (ncrm)

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS reset_token VARCHAR(255),
  ADD COLUMN IF NOT EXISTS reset_token_expiry TIMESTAMP;
