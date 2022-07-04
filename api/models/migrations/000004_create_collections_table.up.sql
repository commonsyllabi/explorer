CREATE TABLE IF NOT EXISTS collections (
 id SERIAL PRIMARY KEY,
 created_at timestamp NOT NULL,
 updated_at timestamp NOT NULL,
 name VARCHAR NOT NULL,
 user_created_id BIGINT NOT NULL
);