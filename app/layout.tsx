import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "TaskBoard - シンプルなプロジェクト管理",
  description: "直感的なカンバンボードでチームのタスク管理を効率化。プロジェクトの進捗を一目で把握し、目標を確実に達成しましょう。",
  icons: {
    icon: [
      { url: '/icon', sizes: '32x32' },
      { url: '/favicon.ico', sizes: '48x48' },
    ],
    apple: [
      { url: '/apple-icon', sizes: '180x180' },
    ],
  },
  keywords: ["タスク管理", "プロジェクト管理", "カンバンボード", "チーム連携", "生産性"],
  authors: [{ name: "TaskBoard Team" }],
  openGraph: {
    title: "TaskBoard - シンプルなプロジェクト管理",
    description: "直感的なカンバンボードでチームのタスク管理を効率化",
    type: "website",
    locale: "ja_JP",
  },
  twitter: {
    card: "summary_large_image",
    title: "TaskBoard - シンプルなプロジェクト管理", 
    description: "直感的なカンバンボードでチームのタスク管理を効率化",
  },
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body className={`${geistSans.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
