-- Setup script for local PostgreSQL database
-- Run this script to create the database and user for local development

-- Create database
CREATE DATABASE bodymind_ai;

-- Connect to the database
\c bodymind_ai;

-- Create auth schema (mimicking Supabase structure)
CREATE SCHEMA IF NOT EXISTS auth;

-- Create a simple users table for local development
CREATE TABLE IF NOT EXISTS auth.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    encrypted_password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create a function to mimic auth.uid() for local development
CREATE OR REPLACE FUNCTION auth.uid()
RETURNS UUID
LANGUAGE plpgsql
AS $$
BEGIN
    -- In local development, this would be set by your authentication middleware
    -- For now, return a test user ID or NULL
    RETURN current_setting('app.current_user_id', TRUE)::UUID;
EXCEPTION
    WHEN OTHERS THEN
        RETURN NULL;
END;
$$;

-- Create a function to mimic auth.jwt() for local development
CREATE OR REPLACE FUNCTION auth.jwt()
RETURNS JSONB
LANGUAGE plpgsql
AS $$
BEGIN
    -- In local development, return a mock JWT payload
    RETURN '{}'::JSONB;
END;
$$;

-- Now run the main schema
-- Note: You need to run the schema.sql file after this setup
-- psql -U postgres -d bodymind_ai -f schema.sql

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE bodymind_ai TO postgres;
GRANT ALL PRIVILEGES ON SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON SCHEMA auth TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO postgres;

-- Create a test user for development
INSERT INTO auth.users (email, encrypted_password)
VALUES ('test@example.com', 'hashed_password_here')
ON CONFLICT DO NOTHING;