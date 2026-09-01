/*
# Create conversations table (single-tenant, no auth)

1. New Tables
- `conversations` — stores chat sessions for the Vamanan GPT experience.
  - `id` (uuid, primary key)
  - `session_id` (text, not null) — a client-generated anonymous session identifier
  - `title` (text, nullable) — a short label for the conversation
  - `created_at` (timestamptz, default now)
  - `updated_at` (timestamptz, default now)
- `messages` — stores individual messages within a conversation.
  - `id` (uuid, primary key)
  - `conversation_id` (uuid, foreign key to conversations, cascade delete)
  - `role` (text, not null) — 'user' or 'assistant'
  - `text` (text, not null) — the message content
  - `title` (text, nullable) — optional title for assistant responses
  - `source` (text, nullable) — optional source citation
  - `created_at` (timestamptz, default now)

2. Security
- Enable RLS on both tables.
- Allow anon + authenticated full CRUD because this is a single-tenant app with no sign-in.
- All data is intentionally public/shared across sessions.

3. Indexes
- Index on conversations.session_id for fast lookups.
- Index on messages.conversation_id for fast message retrieval.
*/

CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  title text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_conversations_session_id ON conversations(session_id);

CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role text NOT NULL,
  text text NOT NULL,
  title text,
  source text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_conversations" ON conversations;
CREATE POLICY "anon_select_conversations" ON conversations FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_conversations" ON conversations;
CREATE POLICY "anon_insert_conversations" ON conversations FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_conversations" ON conversations;
CREATE POLICY "anon_update_conversations" ON conversations FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_conversations" ON conversations;
CREATE POLICY "anon_delete_conversations" ON conversations FOR DELETE
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_select_messages" ON messages;
CREATE POLICY "anon_select_messages" ON messages FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_messages" ON messages;
CREATE POLICY "anon_insert_messages" ON messages FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_messages" ON messages;
CREATE POLICY "anon_update_messages" ON messages FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_messages" ON messages;
CREATE POLICY "anon_delete_messages" ON messages FOR DELETE
  TO anon, authenticated USING (true);
