-- 複数担当者機能追加SQL

-- 1. 新しいカラムを追加（配列型）
ALTER TABLE public.cards 
ADD COLUMN assigned_user_ids uuid[] DEFAULT '{}';

-- 2. 既存の単一担当者データを配列に移行
UPDATE public.cards 
SET assigned_user_ids = ARRAY[assigned_user_id]
WHERE assigned_user_id IS NOT NULL;

-- 3. 古いカラムを削除（バックアップとして残すなら省略可）
-- ALTER TABLE public.cards DROP COLUMN assigned_user_id;

-- 4. card_assigneesテーブルを作成（より柔軟な管理のため）
CREATE TABLE IF NOT EXISTS public.card_assignees (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  card_id uuid REFERENCES public.cards(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  assigned_at timestamp with time zone DEFAULT NOW(),
  UNIQUE(card_id, user_id)
);

-- 5. card_assigneesテーブルのRLS設定
ALTER TABLE public.card_assignees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All users can view card assignees" ON public.card_assignees
  FOR SELECT USING (true);

CREATE POLICY "All users can manage card assignees" ON public.card_assignees
  FOR ALL USING (true);

-- 6. 既存データをcard_assigneesテーブルに移行
INSERT INTO public.card_assignees (card_id, user_id)
SELECT id, assigned_user_id 
FROM public.cards 
WHERE assigned_user_id IS NOT NULL
ON CONFLICT (card_id, user_id) DO NOTHING;

-- 7. カード担当者取得用のビューを作成
CREATE OR REPLACE VIEW public.cards_with_assignees AS
SELECT 
  c.*,
  COALESCE(
    array_agg(
      json_build_object(
        'id', up.id,
        'display_name', up.display_name,
        'email', up.email,
        'avatar_url', up.avatar_url
      )
    ) FILTER (WHERE up.id IS NOT NULL), 
    '{}'::json[]
  ) as assignees
FROM public.cards c
LEFT JOIN public.card_assignees ca ON c.id = ca.card_id
LEFT JOIN public.user_profiles up ON ca.user_id = up.id
GROUP BY c.id, c.title, c.description, c.list_id, c.position, c.due_date, c.due_time, c.assigned_user_id, c.assigned_user_ids, c.created_at, c.updated_at;

-- 8. ビューの権限設定
GRANT SELECT ON public.cards_with_assignees TO authenticated;
GRANT SELECT ON public.cards_with_assignees TO anon;

-- 確認用クエリ
SELECT COUNT(*) as card_count FROM public.cards;
SELECT COUNT(*) as assignee_count FROM public.card_assignees;