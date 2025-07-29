-- 代替案: user_profilesビューを完全に削除して、直接auth.usersを使用

-- ビューを削除
DROP VIEW IF EXISTS public.user_profiles;

-- 代わりに、auth.usersに直接アクセスする権限を付与
-- （これは一時的な解決策です）

-- または、シンプルなテーブルを作成する方法
CREATE TABLE IF NOT EXISTS public.user_profiles_simple (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  display_name text,
  avatar_url text,
  created_at timestamp with time zone DEFAULT now()
);

-- RLS有効化
ALTER TABLE public.user_profiles_simple ENABLE ROW LEVEL SECURITY;

-- 全ユーザーがアクセス可能なポリシー
CREATE POLICY "All users can view profiles" ON public.user_profiles_simple
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their profile" ON public.user_profiles_simple
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their profile" ON public.user_profiles_simple
  FOR UPDATE USING (auth.uid() = id);

-- 現在のユーザーのプロフィールを挿入
INSERT INTO public.user_profiles_simple (id, display_name)
SELECT id, COALESCE(
  raw_user_meta_data->>'full_name',
  raw_user_meta_data->>'name', 
  split_part(email, '@', 1)
) as display_name
FROM auth.users
ON CONFLICT (id) DO UPDATE SET 
  display_name = EXCLUDED.display_name;