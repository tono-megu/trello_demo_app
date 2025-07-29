-- user_profilesビューのアクセス権限を修正

-- 既存のビューを削除
DROP VIEW IF EXISTS public.user_profiles;

-- 新しいuser_profilesビューを作成（セキュリティを簡素化）
CREATE VIEW public.user_profiles AS
SELECT 
  id,
  email,
  COALESCE(
    raw_user_meta_data->>'full_name',
    raw_user_meta_data->>'name', 
    split_part(email, '@', 1)
  ) as display_name,
  raw_user_meta_data->>'avatar_url' as avatar_url
FROM auth.users;

-- user_profilesビューに対するアクセス許可を設定
GRANT SELECT ON public.user_profiles TO authenticated;
GRANT SELECT ON public.user_profiles TO anon;

-- RLSを有効化（念のため）
ALTER VIEW public.user_profiles ENABLE ROW LEVEL SECURITY;

-- 全ユーザーがuser_profilesを閲覧できるポリシーを作成
CREATE POLICY "All users can view user profiles" ON public.user_profiles
  FOR SELECT USING (true);