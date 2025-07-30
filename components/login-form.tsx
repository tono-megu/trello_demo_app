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
import { LogIn, Sparkles, Mail, Lock } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      // Update this route to redirect to an authenticated route. The user already has an active session.
      router.push("/protected");
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred";
      // Supabaseの英語エラーメッセージを日本語に変換
      if (errorMessage === "Invalid login credentials") {
        setError("登録されていないメールアドレスです");
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="bg-white border-0 rounded-2xl shadow-2xl overflow-hidden">
        <CardHeader className="text-center bg-gradient-to-r from-blue-50 to-slate-50 pb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-blue-600 rounded-xl shadow-lg">
              <LogIn className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold text-slate-800">
              ログイン
            </CardTitle>
            <Sparkles className="h-6 w-6 text-blue-500" />
          </div>
          <CardDescription className="text-slate-600 text-lg font-medium">
            アカウントにログインして、プロジェクトを管理しましょう！
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <Label htmlFor="email" className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-3">
                <Mail className="h-4 w-4" />
                メールアドレス
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
            
            <div>
              <div className="flex items-center justify-between mb-3">
                <Label htmlFor="password" className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  パスワード
                </Label>
                <Link
                  href="/auth/forgot-password"
                  className="text-xs text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                >
                  パスワードを忘れた方
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="パスワードを入力..."
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border-2 border-blue-200 focus:border-blue-400 rounded-xl bg-slate-50 p-3 text-base"
              />
            </div>
            
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-sm text-red-600 font-medium">{error}</p>
              </div>
            )}
            
            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200" 
              disabled={isLoading}
            >
              <LogIn className="h-5 w-5 mr-2" />
              {isLoading ? "ログイン中..." : "ログイン"}
            </Button>
            
            <div className="text-center pt-4 border-t border-gray-100">
              <p className="text-sm text-slate-600 mb-2">
                まだアカウントをお持ちでない方
              </p>
              <Link
                href="/auth/sign-up"
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold hover:underline transition-colors"
              >
                <Sparkles className="h-4 w-4" />
                新規アカウント作成
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
