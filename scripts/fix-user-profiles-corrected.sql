-- user_profilesビューの修正版（RLSエラーを解決）

-- 既存のビューを削除
DROP VIEW IF EXISTS public.user_profiles;

-- 新しいuser_profilesビューを作成（RLSなし）
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

-- ビューに対するアクセス許可を設定
GRANT SELECT ON public.user_profiles TO authenticated;
GRANT SELECT ON public.user_profiles TO anon;

-- 確認用クエリ
SELECT COUNT(*) as user_count FROM public.user_profiles;