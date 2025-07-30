import { createClient } from "@/lib/supabase/server";
import { type EmailOtpType } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next");

  if (token_hash && type) {
    const supabase = await createClient();

    const { data, error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });

    if (!error && data?.user) {
      // セッションが正常に確立されたことを確認
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (sessionData.session) {
        // パスワードリセットの場合はupdate-passwordページに、その他は指定されたURLまたはprotectedページに
        if (type === "recovery") {
          redirect("/auth/update-password");
        } else if (next) {
          redirect(next);
        } else {
          redirect("/protected");
        }
      } else {
        // セッションが確立されていない場合はエラー
        redirect(`/auth/error?error=Session not established`);
      }
    } else {
      // redirect the user to an error page with some instructions
      redirect(`/auth/error?error=${error?.message || 'Token verification failed'}`);
    }
  }

  // redirect the user to an error page with some instructions
  redirect(`/auth/error?error=No token hash or type`);
}
