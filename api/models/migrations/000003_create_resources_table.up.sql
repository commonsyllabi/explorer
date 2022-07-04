CREATE TABLE IF NOT EXISTS resources (
 id SERIAL PRIMARY KEY,
 created_at timestamp NOT NULL,
 updated_at timestamp NOT NULL,
 name VARCHAR NOT NULL,
 syllabus_id BIGINT NOT NULL
);