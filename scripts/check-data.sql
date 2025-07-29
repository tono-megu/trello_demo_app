-- データが正しく入っているか確認用SQL

-- ユーザー一覧
SELECT id, email FROM auth.users;

-- ボード一覧
SELECT id, title, user_id, created_at FROM public.boards;

-- リスト一覧
SELECT id, title, board_id FROM public.lists;

-- カード一覧（納期付きのみ）
SELECT id, title, due_date, due_time FROM public.cards WHERE due_date IS NOT NULL;