-- 最もシンプルな解決策：ビューを使わずテーブルを作成

-- 既存のビューを削除
DROP VIEW IF EXISTS public.user_profiles;

-- シンプルなuser_profilesテーブルを作成
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id uuid PRIMARY KEY,
  email text,
  display_name text,
  avatar_url text
);

-- RLS有効化
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- 全ユーザーが閲覧可能なポリシー
CREATE POLICY "Everyone can view profiles" ON public.user_profiles
  FOR SELECT USING (true);

-- 現在のユーザーデータを挿入
INSERT INTO public.user_profiles (id, email, display_name)
SELECT 
  id,
  email,
  COALESCE(
    raw_user_meta_data->>'full_name',
    raw_user_meta_data->>'name', 
    split_part(email, '@', 1)
  ) as display_name
FROM auth.users
ON CONFLICT (id) DO UPDATE SET 
  email = EXCLUDED.email,
  display_name = EXCLUDED.display_name;

-- 確認用クエリ
SELECT * FROM public.user_profiles;