-- EdithPress — Postgres initialization script
-- Runs automatically on first container start

-- Enable useful extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";   -- UUID generation (uuid_generate_v4())
CREATE EXTENSION IF NOT EXISTS "pg_trgm";     -- Trigram similarity for full-text search
CREATE EXTENSION IF NOT EXISTS "citext";      -- Case-insensitive text type (useful for emails)

-- Set default timezone
ALTER DATABASE edithpress_dev SET timezone TO 'UTC';
