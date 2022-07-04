CREATE TABLE IF NOT EXISTS syllabuses (
 id SERIAL PRIMARY KEY,
 created_at timestamp NOT NULL,
 updated_at timestamp NOT NULL,
 title VARCHAR NOT NULL,
 user_id BIGINT NOT NULL,
 syllabus_collection_id BIGINT NOT NULL
);