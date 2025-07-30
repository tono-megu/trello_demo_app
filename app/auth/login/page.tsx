import { LoginForm } from "@/components/login-form";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ verified?: string }>;
}) {
  const params = await searchParams;
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {params.verified && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
            <p className="text-sm text-green-700 font-medium text-center">
              ✅ メール認証が完了しました！ログインしてご利用ください。
            </p>
          </div>
        )}
        <LoginForm />
      </div>
    </div>
  );
}
