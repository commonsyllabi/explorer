CREATE TABLE IF NOT EXISTS syllabuses (
 id uuid DEFAULT gen_random_uuid(),
 created_at timestamp NOT NULL,
 updated_at timestamp NOT NULL,
 title VARCHAR NOT NULL,
 user_id uuid DEFAULT gen_random_uuid(),
 collection_id uuid DEFAULT gen_random_uuid()
);