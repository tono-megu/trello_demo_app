import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle, Sparkles, Mail } from "lucide-react";
import Link from "next/link";

export default function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Card className="bg-white border-0 rounded-2xl shadow-2xl overflow-hidden">
          <CardHeader className="text-center bg-gradient-to-r from-green-50 to-blue-50 pb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 bg-green-600 rounded-xl shadow-lg">
                <CheckCircle className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-3xl font-bold text-slate-800">
                登録完了
              </CardTitle>
              <Sparkles className="h-6 w-6 text-green-500" />
            </div>
            <CardDescription className="text-slate-600 text-lg font-medium">
              🎉 アカウント登録ありがとうございます！
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8 text-center">
            <div className="mb-6">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-100 to-green-100 rounded-full flex items-center justify-center mb-4">
                <Mail className="h-8 w-8 text-blue-600" />
              </div>
              <div className="text-6xl mb-4">📧</div>
            </div>
            
            <p className="text-sm text-slate-600 leading-relaxed mb-6">
              📨 メールアドレスに確認メールを送信しました。<br />
              メール内のリンクをクリックして、<br />
              アカウントを有効化してください。
            </p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
              <p className="text-xs text-blue-700 font-medium">
                💡 メールが届かない場合は、迷惑メールフォルダもご確認ください
              </p>
            </div>
            
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              <Sparkles className="h-4 w-4" />
              🎯 ログインページに戻る
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
