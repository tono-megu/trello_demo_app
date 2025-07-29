# カンバンボードアプリ セットアップ手順

## 1. 環境変数の設定

`.env.example`を`.env.local`にコピーし、Supabaseの認証情報を設定してください：

```bash
cp .env.example .env.local
```

`.env.local`を編集して以下を設定：
```
NEXT_PUBLIC_SUPABASE_URL=[Supabaseプロジェクト URL]
NEXT_PUBLIC_SUPABASE_ANON_KEY=[Supabase Anon Key]
```

## 2. Supabaseデータベースのセットアップ

1. [Supabase Dashboard](https://supabase.com/dashboard)にログインし、新しいプロジェクトを作成
2. プロジェクトの「SQL Editor」で`supabase-schema.sql`の内容を実行
3. これによりテーブル（boards, lists, cards）とRow Level Security (RLS)ポリシーが作成されます

### データベーススキーマ

```sql
-- メインテーブル
- boards (id, title, description, user_id, timestamps)
- lists (id, title, board_id, position, timestamps)  
- cards (id, title, description, list_id, position, timestamps)

-- RLS ポリシー
- ユーザーは自分のボードのみアクセス可能
- リストとカードは所有するボードを通じてアクセス制御
```

## 3. 依存関係のインストール

```bash
npm install
```

追加で以下のドラッグ&ドロップライブラリがインストールされます：
- @dnd-kit/core
- @dnd-kit/sortable
- @dnd-kit/utilities
- @dnd-kit/modifiers

## 4. 開発サーバーの起動

```bash
npm run dev
```

アプリケーションは http://localhost:3000 で起動します。

## 5. 機能の確認

1. **認証**: `/auth/sign-up`でアカウント作成
2. **ボード管理**: `/protected/boards`でボード一覧・作成
3. **カンバン機能**: 個別ボードでリスト・カード作成、ドラッグ&ドロップ
4. **リアルタイム**: 複数タブで開いて変更が同期されることを確認

## 6. プロダクション デプロイ

### Vercelでのデプロイ

1. GitHubリポジトリにプッシュ
2. [Vercel](https://vercel.com)でプロジェクトをインポート
3. 環境変数（`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`）を設定
4. デプロイ完了

### 重要な設定項目

- **Supabase URL**: プロジェクト設定 > API から取得
- **Anon Key**: プロジェクト設定 > API から取得
- **RLS**: データベースでRow Level Securityが有効になっていることを確認

## トラブルシューティング

### 認証エラー
- 環境変数が正しく設定されているか確認
- Supabaseプロジェクトが有効か確認

### データベース接続エラー
- `supabase-schema.sql`が正常に実行されているか確認
- RLSポリシーが適用されているか確認

### リアルタイム同期が動作しない
- SupabaseプロジェクトでRealtime機能が有効になっているか確認
- ブラウザの開発者ツールでWebSocket接続を確認