import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Sparkles } from "lucide-react";
import Link from "next/link";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ error: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Card className="bg-white border-0 rounded-2xl shadow-2xl overflow-hidden">
          <CardHeader className="text-center bg-gradient-to-r from-red-50 to-orange-50 pb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 bg-red-600 rounded-xl shadow-lg">
                <AlertCircle className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-3xl font-bold text-slate-800">
                エラーが発生しました
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-8 text-center">
            <div className="mb-6">
              <div className="text-6xl mb-4">😔</div>
            </div>
            
            {params?.error ? (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                <p className="text-sm text-red-700 font-medium break-words">
                  ❌ {params.error}
                </p>
              </div>
            ) : (
              <p className="text-sm text-slate-600 leading-relaxed mb-6">
                予期しないエラーが発生しました。<br />
                お手数ですが、再度お試しください。
              </p>
            )}
            
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
