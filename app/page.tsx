import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  
  // 認証状態をチェック
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 認証済みユーザーはprotectedページに、未認証ユーザーはログインページにリダイレクト
  if (user) {
    redirect("/protected");
  } else {
    redirect("/auth/login");
  }
}
