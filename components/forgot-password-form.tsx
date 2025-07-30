"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { KeyRound, Sparkles, Mail, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      // The url which will be included in the email. This URL needs to be configured in your redirect URLs in the Supabase dashboard at https://supabase.com/dashboard/project/_/auth/url-configuration
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/update-password`,
      });
      if (error) throw error;
      setSuccess(true);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      {success ? (
        <Card className="bg-white border-0 rounded-2xl shadow-2xl overflow-hidden">
          <CardHeader className="text-center bg-gradient-to-r from-green-50 to-blue-50 pb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 bg-green-600 rounded-xl shadow-lg">
                <CheckCircle className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-3xl font-bold text-slate-800">
                メール送信完了
              </CardTitle>
              <Sparkles className="h-6 w-6 text-green-500" />
            </div>
            <CardDescription className="text-slate-600 text-lg font-medium">
              🎯 パスワード再設定メールを送信しました！
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8 text-center">
            <p className="text-sm text-slate-600 leading-relaxed mb-6">
              📧 メールアドレスとパスワードで登録されている場合、<br />
              パスワード再設定用のメールが届きます。<br />
              メール内のリンクをクリックして、新しいパスワードを設定してください。
            </p>
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold hover:underline transition-colors"
            >
              <Sparkles className="h-4 w-4" />
              🎯 ログインページに戻る
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-white border-0 rounded-2xl shadow-2xl overflow-hidden">
          <CardHeader className="text-center bg-gradient-to-r from-blue-50 to-slate-50 pb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 bg-blue-600 rounded-xl shadow-lg">
                <KeyRound className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-3xl font-bold text-slate-800">
                パスワード再設定
              </CardTitle>
              <Sparkles className="h-6 w-6 text-blue-500" />
            </div>
            <CardDescription className="text-slate-600 text-lg font-medium">
              🔑 メールアドレスを入力して、パスワード再設定リンクを受け取りましょう！
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleForgotPassword} className="space-y-6">
              <div>
                <Label htmlFor="email" className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-3">
                  <Mail className="h-4 w-4" />
                  📧 メールアドレス
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border-2 border-blue-200 focus:border-blue-400 rounded-xl bg-slate-50 p-3 text-base"
                />
              </div>
              
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-sm text-red-600 font-medium">❌ {error}</p>
                </div>
              )}
              
              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200" 
                disabled={isLoading}
              >
                <KeyRound className="h-5 w-5 mr-2" />
                {isLoading ? "送信中..." : "🚀 再設定メールを送信"}
              </Button>
              
              <div className="text-center pt-4 border-t border-gray-100">
                <p className="text-sm text-slate-600 mb-2">
                  アカウントをお持ちの方
                </p>
                <Link
                  href="/auth/login"
                  className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold hover:underline transition-colors"
                >
                  <Sparkles className="h-4 w-4" />
                  🎯 ログイン
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
