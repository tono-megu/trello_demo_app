-- テストデータ投入用SQL
-- 事前に認証されたユーザーのuser_idが必要です

-- サンプルボードを作成
INSERT INTO public.boards (id, title, description, user_id, created_at, updated_at) 
VALUES 
  ('550e8400-e29b-41d4-a716-446655440001', 'プロジェクトA', 'メインプロジェクトのタスク管理', (SELECT auth.uid()), NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440002', 'プロジェクトB', '夏季プロジェクト', (SELECT auth.uid()), NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440003', 'プロジェクトC', '短期タスク集', (SELECT auth.uid()), NOW(), NOW());

-- サンプルリストを作成
INSERT INTO public.lists (id, title, board_id, position, created_at, updated_at)
VALUES
  ('660e8400-e29b-41d4-a716-446655440001', 'TODO', '550e8400-e29b-41d4-a716-446655440001', 1, NOW(), NOW()),
  ('660e8400-e29b-41d4-a716-446655440002', '進行中', '550e8400-e29b-41d4-a716-446655440001', 2, NOW(), NOW()),
  ('660e8400-e29b-41d4-a716-446655440003', '完了待ち', '550e8400-e29b-41d4-a716-446655440001', 3, NOW(), NOW()),
  ('660e8400-e29b-41d4-a716-446655440004', 'TODO', '550e8400-e29b-41d4-a716-446655440002', 1, NOW(), NOW()),
  ('660e8400-e29b-41d4-a716-446655440005', '作業中', '550e8400-e29b-41d4-a716-446655440002', 2, NOW(), NOW()),
  ('660e8400-e29b-41d4-a716-446655440006', 'レビュー', '550e8400-e29b-41d4-a716-446655440003', 1, NOW(), NOW());

-- 8月の納期を持つタスクカードを10個作成
INSERT INTO public.cards (id, title, description, list_id, position, due_date, due_time, created_at, updated_at)
VALUES
  ('770e8400-e29b-41d4-a716-446655440001', 'プレゼン資料の作成', 'クライアント向けの提案資料を準備する', '660e8400-e29b-41d4-a716-446655440001', 1, '2025-08-05', '10:00', NOW(), NOW()),
  ('770e8400-e29b-41d4-a716-446655440002', 'ミーティングの準備', 'チームミーティングのアジェンダを作成', '660e8400-e29b-41d4-a716-446655440002', 1, '2025-08-08', '14:30', NOW(), NOW()),
  ('770e8400-e29b-41d4-a716-446655440003', 'レポート提出', '月次レポートの作成と提出', '660e8400-e29b-41d4-a716-446655440003', 1, '2025-08-12', '17:00', NOW(), NOW()),
  ('770e8400-e29b-41d4-a716-446655440004', 'コードレビュー', '新機能のコードレビューを実施', '660e8400-e29b-41d4-a716-446655440006', 1, '2025-08-15', '11:00', NOW(), NOW()),
  ('770e8400-e29b-41d4-a716-446655440005', 'データベース設計', '新システムのDB設計書作成', '660e8400-e29b-41d4-a716-446655440004', 1, '2025-08-18', '16:00', NOW(), NOW()),
  ('770e8400-e29b-41d4-a716-446655440006', 'テスト実行', 'システムの総合テストを実行', '660e8400-e29b-41d4-a716-446655440005', 1, '2025-08-20', '09:30', NOW(), NOW()),
  ('770e8400-e29b-41d4-a716-446655440007', '仕様書更新', 'システム仕様書の最新版への更新', '660e8400-e29b-41d4-a716-446655440001', 2, '2025-08-22', '13:00', NOW(), NOW()),
  ('770e8400-e29b-41d4-a716-446655440008', 'UI改善作業', 'ユーザーインターフェースの改善実装', '660e8400-e29b-41d4-a716-446655440002', 2, '2025-08-25', '15:30', NOW(), NOW()),
  ('770e8400-e29b-41d4-a716-446655440009', 'パフォーマンス最適化', 'システムの処理速度改善', '660e8400-e29b-41d4-a716-446655440005', 2, '2025-08-28', '10:15', NOW(), NOW()),
  ('770e8400-e29b-41d4-a716-446655440010', 'セキュリティ監査', 'システムのセキュリティ点検と修正', '660e8400-e29b-41d4-a716-446655440006', 2, '2025-08-30', '14:00', NOW(), NOW());