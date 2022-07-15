CREATE TABLE IF NOT EXISTS users (
 id uuid DEFAULT gen_random_uuid(),
 created_at timestamp NOT NULL,
 updated_at timestamp NOT NULL,
 email VARCHAR UNIQUE NOT NULL
);