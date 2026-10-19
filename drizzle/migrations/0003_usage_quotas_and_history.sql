ALTER TABLE public.usage_daily ADD COLUMN IF NOT EXISTS ai_questions integer NOT NULL DEFAULT 0;
CREATE UNIQUE INDEX IF NOT EXISTS usage_daily_user_day_uidx ON public.usage_daily(user_id, day);

CREATE TABLE public.translation_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  source_lang text NOT NULL,
  target_lang text NOT NULL,
  source_text text NOT NULL,
  translation text NOT NULL,
  phonetic text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.translation_history TO authenticated;
GRANT ALL ON public.translation_history TO service_role;
ALTER TABLE public.translation_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own translation history" ON public.translation_history FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX translation_history_user_idx ON public.translation_history(user_id, created_at DESC);

CREATE TABLE public.ai_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL DEFAULT 'Nouvelle discussion',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ai_conversations TO authenticated;
GRANT ALL ON public.ai_conversations TO service_role;
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own conversations" ON public.ai_conversations FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.ai_chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.ai_conversations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  role text NOT NULL,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.ai_chat_messages TO authenticated;
GRANT ALL ON public.ai_chat_messages TO service_role;
ALTER TABLE public.ai_chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own chat messages" ON public.ai_chat_messages FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX ai_chat_messages_conv_idx ON public.ai_chat_messages(conversation_id, created_at);