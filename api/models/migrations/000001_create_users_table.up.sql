CREATE TABLE IF NOT EXISTS users (
 id SERIAL PRIMARY KEY,
 created_at timestamp NOT NULL,
 updated_at timestamp NOT NULL,
 email VARCHAR UNIQUE NOT NULL
);