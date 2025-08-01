import { redirect } from "next/navigation";
import Link from "next/link";

import { createClient } from "@/lib/supabase/server";
import { InfoIcon, Trello, ArrowRight, Home, Sparkles, CheckSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LayoutWrapper } from "@/app/layout-wrapper";
import { DailyCalendar } from "@/components/daily-calendar";
import { UpcomingTasks } from "@/components/upcoming-tasks";
import { HomeQuickTaskWithRefresh } from "@/components/home-quick-task-with-refresh";
import { getUpcomingTasks } from "@/lib/supabase/tasks";

export default async function ProtectedPage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  const upcomingTasks = await getUpcomingTasks();

  return (
    <LayoutWrapper>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
        <div className="w-full px-6 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-blue-600 rounded-lg">
                      <Home className="h-6 w-6 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold text-slate-800">
                      ホーム
                    </h1>
                    <Sparkles className="h-5 w-5 text-blue-500" />
                  </div>
                  <p className="text-slate-600 text-lg font-medium">
                    🎯 プロジェクトを管理して、目標を達成しましょう！
                  </p>
                </div>
              </div>
              <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
                <Link href="/boards">
                  <Trello className="h-5 w-5 mr-2" />
                  ボード一覧を見る
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>


            {/* あなたの今日のタスクセクション */}
            <div className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-600 rounded-lg">
                    <CheckSquare className="h-6 w-6 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-slate-800">
                    あなたの今日のタスク
                  </h2>
                  <Sparkles className="h-5 w-5 text-blue-500" />
                </div>
                <HomeQuickTaskWithRefresh />
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 左カラム: デイリーカレンダー */}
                <div>
                  <DailyCalendar />
                </div>
                
                {/* 右カラム: 直近納期のタスク */}
                <div>
                  <UpcomingTasks initialTasks={upcomingTasks} />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* 小さな認証インジケーター（右下） */}
        <div className="fixed bottom-4 right-4 z-10">
          <div className="bg-white/90 backdrop-blur-sm rounded-full shadow-md border border-gray-200 px-3 py-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <InfoIcon size="14" className="text-gray-400" />
              <span className="text-xs text-gray-500 font-medium">認証済み</span>
            </div>
          </div>
        </div>
      </div>
    </LayoutWrapper>
  );
}
