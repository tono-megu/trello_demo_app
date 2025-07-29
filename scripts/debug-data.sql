-- デバッグ用：データの詳細確認

-- 1. 現在ログインしているユーザーのIDを確認
SELECT 
  'Current User' as type,
  auth.uid() as user_id,
  'N/A' as title,
  'N/A' as created_method
UNION ALL

-- 2. 全てのボードのuser_id確認（SQLで追加 vs アプリで追加）
SELECT 
  'Board' as type,
  user_id,
  title,
  CASE 
    WHEN id IN ('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003') 
    THEN 'SQL追加' 
    ELSE 'アプリ追加' 
  END as created_method
FROM public.boards
ORDER BY created_method, title;