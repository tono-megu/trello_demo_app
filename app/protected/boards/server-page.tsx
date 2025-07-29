import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BoardsClient } from "./boards-client";

export default async function BoardsPage() {
  const supabase = await createClient();

  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    redirect("/auth/login");
  }

  // サーバーサイドでボードデータを取得
  const { data: boards, error: boardsError } = await supabase
    .from('boards')
    .select('*')
    .order('created_at', { ascending: false });

  if (boardsError) {
    console.error('Failed to load boards:', boardsError);
  }

  return <BoardsClient initialBoards={boards || []} />;
}