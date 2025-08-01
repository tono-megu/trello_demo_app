"use client";

import { EnvVarWarning } from "@/components/env-var-warning";
import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { hasEnvVars } from "@/lib/utils";
import Link from "next/link";
import { Trello, Home, FolderOpen } from "lucide-react";

export function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen flex flex-col items-center">
      <div className="flex-1 w-full flex flex-col gap-20 items-center">
        <nav className="w-full flex justify-center bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg sticky top-0 z-50">
          <div className="w-full max-w-7xl flex justify-between items-center px-6 py-3">
            {/* ロゴ・ブランディングエリア */}
            <div className="flex items-center gap-6">
              <Link href="/" className="flex items-center gap-3 text-white hover:text-blue-100 transition-colors">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <Trello className="h-6 w-6" />
                </div>
                <span className="text-xl font-bold">MyKanban</span>
              </Link>
              
              {/* ナビゲーションメニュー */}
              <div className="hidden md:flex items-center gap-4">
                <Link 
                  href="/" 
                  className="flex items-center gap-2 px-3 py-2 text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
                >
                  <Home className="h-4 w-4" />
                  <span className="text-sm font-medium">ホーム</span>
                </Link>
                <Link 
                  href="/boards" 
                  className="flex items-center gap-2 px-3 py-2 text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
                >
                  <FolderOpen className="h-4 w-4" />
                  <span className="text-sm font-medium">ボード</span>
                </Link>
              </div>
            </div>

            {/* 右側のアクション */}
            <div className="flex items-center gap-3">
              {!hasEnvVars ? (
                <EnvVarWarning />
              ) : (
                <div className="bg-white/10 rounded-lg p-1">
                  <AuthButton />
                </div>
              )}
            </div>
          </div>
        </nav>
        <div className="flex-1 flex flex-col gap-20 max-w-5xl p-5">
          {children}
        </div>

        <footer className="w-full flex items-center justify-center border-t mx-auto text-center text-xs gap-8 py-16">
          <p className="text-gray-500">
            © div.inc
          </p>
          <ThemeSwitcher />
        </footer>
      </div>
    </main>
  );
}