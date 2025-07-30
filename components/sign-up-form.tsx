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
import { UserPlus, Sparkles, Mail, Lock } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function SignUpForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    if (password !== repeatPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/protected`,
        },
      });
      if (error) throw error;
      router.push("/auth/sign-up-success");
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
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
              <UserPlus className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold text-slate-800">
              新規登録
            </CardTitle>
            <Sparkles className="h-6 w-6 text-blue-500" />
          </div>
          <CardDescription className="text-slate-600 text-lg font-medium">
            ✨ 新しいアカウントを作成して、プロジェクト管理を始めましょう！
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          <form onSubmit={handleSignUp} className="space-y-6">
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
            
            <div>
              <Label htmlFor="password" className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-3">
                <Lock className="h-4 w-4" />
                🔒 パスワード
              </Label>
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
            
            <div>
              <Label htmlFor="repeat-password" className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-3">
                <Lock className="h-4 w-4" />
                🔒 パスワード（確認）
              </Label>
              <Input
                id="repeat-password"
                type="password"
                placeholder="パスワードを再度入力..."
                required
                value={repeatPassword}
                onChange={(e) => setRepeatPassword(e.target.value)}
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
              <UserPlus className="h-5 w-5 mr-2" />
              {isLoading ? "アカウント作成中..." : "🚀 アカウント作成"}
            </Button>
            
            <div className="text-center pt-4 border-t border-gray-100">
              <p className="text-sm text-slate-600 mb-2">
                既にアカウントをお持ちの方
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
    </div>
  );
}
