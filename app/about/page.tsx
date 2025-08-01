import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Trello, Sparkles, LogIn, UserPlus, CheckSquare, Calendar, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function Home() {
  const supabase = await createClient();
  
  // 認証状態をチェック
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 認証済みユーザーはホームページにリダイレクト
  if (user) {
    redirect("/");
  }

  // 未認証ユーザーには美しいランディングページを表示
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      {/* ヘッダー */}
      <header className="w-full px-6 py-4">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Trello className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">TaskBoard</h1>
          </div>
          <div className="flex items-center gap-3">
            <Button asChild variant="outline" className="border-blue-200 text-blue-600 hover:bg-blue-50">
              <Link href="/auth/login">
                <LogIn className="h-4 w-4 mr-2" />
                ログイン
              </Link>
            </Button>
            <Button asChild className="bg-blue-600 hover:bg-blue-700">
              <Link href="/auth/sign-up">
                <UserPlus className="h-4 w-4 mr-2" />
                新規登録
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="w-full px-6 py-16">
        <div className="max-w-6xl mx-auto">
          {/* ヒーローセクション */}
          <div className="text-center mb-20">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Sparkles className="h-8 w-8 text-blue-500" />
              <h2 className="text-5xl font-bold text-slate-800">
                プロジェクト管理を
              </h2>
              <Sparkles className="h-8 w-8 text-blue-500" />
            </div>
            <h3 className="text-5xl font-bold text-blue-600 mb-6">
              もっとシンプルに
            </h3>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-8 leading-relaxed">
              🎯 直感的なカンバンボードで、チームのタスク管理を効率化。<br />
              プロジェクトの進捗を一目で把握し、目標を確実に達成しましょう。
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
                <Link href="/auth/sign-up">
                  <UserPlus className="h-5 w-5 mr-2" />
                  🚀 無料で始める
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-blue-200 text-blue-600 hover:bg-blue-50 font-semibold px-8 py-4 rounded-xl">
                <Link href="/auth/login">
                  <LogIn className="h-5 w-5 mr-2" />
                  既にアカウントをお持ちの方
                </Link>
              </Button>
            </div>
          </div>

          {/* 機能紹介 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            <Card className="bg-white border-0 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-100 to-blue-200 rounded-full flex items-center justify-center mb-4">
                  <CheckSquare className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-xl font-bold text-slate-800">
                  タスク管理
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-slate-600 leading-relaxed">
                  ドラッグ&ドロップで直感的にタスクを管理。優先度や期限も一目でわかります。
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-white border-0 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-16 h-16 bg-gradient-to-r from-green-100 to-green-200 rounded-full flex items-center justify-center mb-4">
                  <Users className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-xl font-bold text-slate-800">
                  チーム連携
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-slate-600 leading-relaxed">
                  チームメンバーとリアルタイムで同期。担当者の割り当てや進捗共有も簡単です。
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-white border-0 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-16 h-16 bg-gradient-to-r from-purple-100 to-purple-200 rounded-full flex items-center justify-center mb-4">
                  <Calendar className="h-8 w-8 text-purple-600" />
                </div>
                <CardTitle className="text-xl font-bold text-slate-800">
                  スケジュール管理
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-slate-600 leading-relaxed">
                  期限管理とカレンダー表示で、プロジェクトのスケジュールを見える化します。
                </CardDescription>
              </CardContent>
            </Card>
          </div>

          {/* CTA セクション */}
          <div className="text-center">
            <Card className="bg-gradient-to-r from-blue-600 to-blue-700 border-0 rounded-2xl shadow-2xl overflow-hidden max-w-4xl mx-auto">
              <CardContent className="p-12 text-center">
                <h3 className="text-3xl font-bold text-white mb-4">
                  今すぐ始めて、生産性を向上させましょう
                </h3>
                <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
                  無料でアカウントを作成して、チームのプロジェクト管理を次のレベルへ
                </p>
                <Button asChild size="lg" className="bg-white text-blue-600 hover:bg-gray-50 font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
                  <Link href="/auth/sign-up">
                    <Sparkles className="h-5 w-5 mr-2" />
                    🎯 無料アカウント作成
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* フッター */}
      <footer className="w-full px-6 py-8 mt-20 border-t border-gray-200">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="p-1 bg-blue-600 rounded">
              <Trello className="h-4 w-4 text-white" />
            </div>
            <p className="text-slate-600 font-medium">TaskBoard</p>
          </div>
          <p className="text-sm text-slate-500">
            © 2024 TaskBoard. シンプルで効果的なプロジェクト管理ツール
          </p>
        </div>
      </footer>
    </div>
  );
}
