-- RLSポリシーを全ユーザー閲覧可能に変更

-- 既存のポリシーを削除
DROP POLICY IF EXISTS "Users can view their own boards" ON public.boards;
DROP POLICY IF EXISTS "Users can insert their own boards" ON public.boards;
DROP POLICY IF EXISTS "Users can update their own boards" ON public.boards;
DROP POLICY IF EXISTS "Users can delete their own boards" ON public.boards;

DROP POLICY IF EXISTS "Users can view lists from their boards" ON public.lists;
DROP POLICY IF EXISTS "Users can insert lists to their boards" ON public.lists;
DROP POLICY IF EXISTS "Users can update lists from their boards" ON public.lists;
DROP POLICY IF EXISTS "Users can delete lists from their boards" ON public.lists;

DROP POLICY IF EXISTS "Users can view cards from their boards" ON public.cards;
DROP POLICY IF EXISTS "Users can insert cards to their boards" ON public.cards;
DROP POLICY IF EXISTS "Users can update cards from their boards" ON public.cards;
DROP POLICY IF EXISTS "Users can delete cards from their boards" ON public.cards;

-- 新しいポリシー：全ユーザーが全データを閲覧・操作可能

-- Boards policies（全ユーザーが全ボードにアクセス可能）
CREATE POLICY "All users can view all boards" ON public.boards
  FOR SELECT USING (true);

CREATE POLICY "All users can insert boards" ON public.boards
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "All users can update all boards" ON public.boards
  FOR UPDATE USING (true);

CREATE POLICY "All users can delete all boards" ON public.boards
  FOR DELETE USING (true);

-- Lists policies（全ユーザーが全リストにアクセス可能）
CREATE POLICY "All users can view all lists" ON public.lists
  FOR SELECT USING (true);

CREATE POLICY "All users can insert lists" ON public.lists
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "All users can update all lists" ON public.lists
  FOR UPDATE USING (true);

CREATE POLICY "All users can delete all lists" ON public.lists
  FOR DELETE USING (true);

-- Cards policies（全ユーザーが全カードにアクセス可能）
CREATE POLICY "All users can view all cards" ON public.cards
  FOR SELECT USING (true);

CREATE POLICY "All users can insert cards" ON public.cards
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "All users can update all cards" ON public.cards
  FOR UPDATE USING (true);

CREATE POLICY "All users can delete all cards" ON public.cards
  FOR DELETE USING (true);