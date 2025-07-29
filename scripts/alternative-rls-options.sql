-- 代替案1: 読み取り専用の共有（他人のボードは閲覧のみ、編集は作成者のみ）
/*
CREATE POLICY "All users can view all boards" ON public.boards
  FOR SELECT USING (true);

CREATE POLICY "Users can modify their own boards" ON public.boards
  FOR ALL USING (auth.uid() = user_id);
*/

-- 代替案2: チーム制（同じorganization_idのユーザー間で共有）
/*
-- boards テーブルに organization_id カラムを追加する場合
CREATE POLICY "Team members can access boards" ON public.boards
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_organizations uo1, user_organizations uo2 
      WHERE uo1.user_id = auth.uid() 
      AND uo2.user_id = boards.user_id 
      AND uo1.organization_id = uo2.organization_id
    )
  );
*/

-- 現在適用中: 完全オープン（全ユーザーが全データにアクセス可能）