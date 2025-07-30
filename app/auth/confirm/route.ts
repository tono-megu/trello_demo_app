import { createClient } from "@/lib/supabase/server";
import { type EmailOtpType } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
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
      // パスワードリセットの場合はupdate-passwordページに、メール認証の場合はログインページに、その他は指定されたURLまたはprotectedページに
      let redirectPath = "/protected";
      if (type === "recovery") {
        redirectPath = "/auth/update-password";
      } else if (type === "signup") {
        redirectPath = "/auth/login?verified=true";
      } else if (next) {
        redirectPath = next;
      }

      // 本番環境とローカル環境を考慮したリダイレクト
      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocalEnv = process.env.NODE_ENV === "development";
      
      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${redirectPath}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${redirectPath}`);
      } else {
        return NextResponse.redirect(`${origin}${redirectPath}`);
      }
    } else {
      // redirect the user to an error page with some instructions
      const errorMessage = error?.message || 'Token verification failed';
      console.error("OTP verification failed:", errorMessage);
      return NextResponse.redirect(`${origin}/auth/error?error=${encodeURIComponent(errorMessage)}`);
    }
  }

  // redirect the user to an error page with some instructions
  console.error("Missing token_hash or type parameters");
  return NextResponse.redirect(`${origin}/auth/error?error=${encodeURIComponent("Invalid reset link")}`);
}
