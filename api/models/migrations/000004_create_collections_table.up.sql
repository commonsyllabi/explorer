CREATE TABLE IF NOT EXISTS collections (
 id uuid DEFAULT gen_random_uuid(),
 created_at timestamp NOT NULL,
 updated_at timestamp NOT NULL,
 name VARCHAR NOT NULL,
 user_id uuid DEFAULT gen_random_uuid()
);