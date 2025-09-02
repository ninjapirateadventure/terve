-- Initial database schema for Terve Finnish Learning App
-- This will be automatically executed when the database container starts

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Basic tables will be created by TypeORM in development mode
-- This file is mainly for production initialization

-- Create a basic health check function
CREATE OR REPLACE FUNCTION database_health_check() 
RETURNS TEXT AS $$
BEGIN
    RETURN 'Database is healthy at ' || NOW();
END;
$$ LANGUAGE plpgsql;

-- Create a simple log table for initialization
CREATE TABLE IF NOT EXISTS init_log (
    id SERIAL PRIMARY KEY,
    message TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO init_log (message) VALUES ('Database initialized successfully');
