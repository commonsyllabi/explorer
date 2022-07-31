CREATE TABLE IF NOT EXISTS attachments (
 id uuid DEFAULT gen_random_uuid(),
 created_at timestamp NOT NULL,
 updated_at timestamp NOT NULL,
 name VARCHAR NOT NULL,
 syllabus_id uuid DEFAULT gen_random_uuid()
);