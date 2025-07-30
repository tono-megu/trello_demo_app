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
import { Lock, Sparkles, Shield } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

export function UpdatePasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionChecked, setSessionChecked] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // コンポーネントマウント時にURLパラメータからセッションを確立
  useEffect(() => {
    const establishSession = async () => {
      const supabase = createClient();
      
      // URLパラメータからtoken_hashとtypeを取得
      const token_hash = searchParams.get('token_hash');
      const type = searchParams.get('type');
      
      console.log("URL params:", { token_hash, type });
      
      if (token_hash && type) {
        try {
          // OTPを検証してセッションを確立
          const { data, error } = await supabase.auth.verifyOtp({
            type: type as any,
            token_hash,
          });
          
          console.log("OTP verification result:", { data, error });
          
          if (error) {
            console.error("OTP verification failed:", error);
            setError("パスワード再設定リンクが無効または期限切れです。再度お試しください。");
          } else if (data?.user) {
            console.log("Session established successfully");
            // セッション確立成功
          }
        } catch (err) {
          console.error("Session establishment error:", err);
          setError("認証エラーが発生しました。再度お試しください。");
        }
      } else {
        // URLパラメータがない場合はセッションを確認
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        console.log("Session check:", { sessionData, sessionError });
        
        if (sessionError || !sessionData.session) {
          console.error("No session found:", sessionError);
          setError("認証セッションが見つかりません。パスワード再設定リンクを再度お試しください。");
        }
      }
      
      setSessionChecked(true);
    };

    establishSession();
  }, [searchParams]);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      console.log("Starting password update...");
      
      // 現在のユーザー情報を取得
      const { data: userData, error: userError } = await supabase.auth.getUser();
      console.log("User data:", { userData, userError });
      
      if (userError || !userData.user) {
        throw new Error("認証が必要です。パスワード再設定リンクを再度お試しください。");
      }

      // パスワードを更新
      console.log("Updating password...");
      const { data: updateData, error: updateError } = await supabase.auth.updateUser({ 
        password: password 
      });
      
      console.log("Update result:", { updateData, updateError });
      
      if (updateError) {
        console.error("Update error:", updateError);
        throw updateError;
      }
      
      // 成功メッセージを表示してからリダイレクト
      alert("パスワードが正常に更新されました！");
      router.push("/protected");
    } catch (error: unknown) {
      console.error("Password update error:", error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("パスワードの更新に失敗しました");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // セッションチェック中はローディング表示
  if (!sessionChecked) {
    return (
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <Card className="bg-white border-0 rounded-2xl shadow-2xl overflow-hidden">
          <CardContent className="p-8 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="text-slate-600">セッションを確認中...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="bg-white border-0 rounded-2xl shadow-2xl overflow-hidden">
        <CardHeader className="text-center bg-gradient-to-r from-blue-50 to-slate-50 pb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-blue-600 rounded-xl shadow-lg">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold text-slate-800">
              新しいパスワード設定
            </CardTitle>
            <Sparkles className="h-6 w-6 text-blue-500" />
          </div>
          <CardDescription className="text-slate-600 text-lg font-medium">
            🔐 安全な新しいパスワードを設定しましょう！
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          <form onSubmit={handleUpdatePassword} className="space-y-6">
            <div>
              <Label htmlFor="password" className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-3">
                <Lock className="h-4 w-4" />
                🔒 新しいパスワード
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="新しいパスワードを入力..."
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border-2 border-blue-200 focus:border-blue-400 rounded-xl bg-slate-50 p-3 text-base"
                minLength={6}
              />
              <p className="text-xs text-slate-500 mt-2">
                💡 6文字以上で設定することをお勧めします
              </p>
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
              <Shield className="h-5 w-5 mr-2" />
              {isLoading ? "保存中..." : "🚀 新しいパスワードを保存"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
