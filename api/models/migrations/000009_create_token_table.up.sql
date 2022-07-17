CREATE TABLE IF NOT EXISTS tokens (
 id uuid DEFAULT gen_random_uuid() NOT NULL,
 created_at timestamp NOT NULL,
 user_id uuid DEFAULT gen_random_uuid() NOT NULL
);