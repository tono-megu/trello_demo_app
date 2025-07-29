-- 担当者機能追加用SQL

-- 1. cardsテーブルに担当者カラムを追加
ALTER TABLE public.cards 
ADD COLUMN assigned_user_id uuid REFERENCES auth.users(id);

-- 2. ユーザー情報取得用のビューを作成（プロフィール情報含む）
CREATE OR REPLACE VIEW public.user_profiles AS
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

-- 3. user_profilesビューに対するRLSポリシー設定
ALTER VIEW public.user_profiles SET (security_invoker = true);

-- 4. 既存のテストデータに担当者を割り当て（任意）
DO $$
DECLARE
    first_user_id uuid;
    second_user_id uuid;
BEGIN
    -- 最初のユーザーIDを取得
    SELECT id INTO first_user_id FROM auth.users ORDER BY created_at LIMIT 1;
    
    -- 2番目のユーザーIDを取得（存在する場合）
    SELECT id INTO second_user_id FROM auth.users ORDER BY created_at LIMIT 1 OFFSET 1;
    
    -- 半分のカードを最初のユーザーに割り当て
    UPDATE public.cards 
    SET assigned_user_id = first_user_id 
    WHERE id IN (
        SELECT id FROM public.cards 
        ORDER BY created_at 
        LIMIT (SELECT COUNT(*) / 2 FROM public.cards)
    );
    
    -- 残りのカードを2番目のユーザーに割り当て（存在する場合）
    IF second_user_id IS NOT NULL THEN
        UPDATE public.cards 
        SET assigned_user_id = second_user_id 
        WHERE assigned_user_id IS NULL;
    END IF;
END $$;