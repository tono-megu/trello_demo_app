-- SQLで追加したボードのuser_idを現在のユーザーに修正

-- 現在のユーザーIDを取得して、SQLで追加したボードのuser_idを更新
UPDATE public.boards 
SET user_id = auth.uid()
WHERE id IN (
  '550e8400-e29b-41d4-a716-446655440001',
  '550e8400-e29b-41d4-a716-446655440002', 
  '550e8400-e29b-41d4-a716-446655440003'
);

-- 結果確認
SELECT 
  id,
  title,
  user_id,
  CASE 
    WHEN user_id = auth.uid() THEN '✓ 正しい' 
    ELSE '✗ 異なる' 
  END as user_match
FROM public.boards
ORDER BY created_at;