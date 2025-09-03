-- Initial database setup for Terve Finnish Learning App
-- This will be automatically executed when the database container starts

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create the application user if not exists (though this should be handled by Docker)
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_user WHERE usename = 'terve_user') THEN
        CREATE USER terve_user WITH PASSWORD 'terve_password';
    END IF;
END
$$;

-- Grant necessary permissions
GRANT ALL PRIVILEGES ON DATABASE terve TO terve_user;
GRANT ALL ON SCHEMA public TO terve_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO terve_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO terve_user;

-- Set default privileges for future objects
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO terve_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO terve_user;

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

INSERT INTO init_log (message) VALUES ('Database initialized successfully with terve_user');

-- Log the current user
INSERT INTO init_log (message) VALUES ('Current user: ' || current_user);
