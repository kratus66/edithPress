-- Setup script for EdithPress development database
-- Run as postgres superuser: psql -U postgres -f create-db.sql

-- Create user if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'edithpress') THEN
    CREATE USER edithpress WITH PASSWORD 'devpassword123';
  END IF;
END
$$;

-- Create database if not exists
SELECT 'CREATE DATABASE edithpress_dev OWNER edithpress'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'edithpress_dev')\gexec

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE edithpress_dev TO edithpress;
