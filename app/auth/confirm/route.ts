import { createClient } from "@/lib/supabase/server";
import { type EmailOtpType } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next");

  const redirectTo = new URL("/auth/error", request.url);

  if (token_hash && type) {
    const supabase = await createClient();

    const { data, error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });

    if (!error && data?.user && data?.session) {
      // パスワードリセットの場合はupdate-passwordページに、その他は指定されたURLまたはprotectedページに
      if (type === "recovery") {
        redirectTo.pathname = "/auth/update-password";
      } else if (next) {
        redirectTo.pathname = next;
      } else {
        redirectTo.pathname = "/protected";
      }
    } else {
      // redirect the user to an error page with some instructions
      redirectTo.searchParams.set("error", error?.message || 'Token verification failed');
    }
  } else {
    // redirect the user to an error page with some instructions
    redirectTo.searchParams.set("error", "No token hash or type");
  }

  return NextResponse.redirect(redirectTo);
}
