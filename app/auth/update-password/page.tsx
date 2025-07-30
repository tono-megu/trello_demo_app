import { UpdatePasswordForm } from "@/components/update-password-form";
import { Suspense } from "react";

function UpdatePasswordContent() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <UpdatePasswordForm />
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="bg-white border-0 rounded-2xl shadow-2xl overflow-hidden p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-600">読み込み中...</p>
          </div>
        </div>
      </div>
    }>
      <UpdatePasswordContent />
    </Suspense>
  );
}
