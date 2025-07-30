import { UpdatePasswordForm } from "@/components/update-password-form";

export default function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <UpdatePasswordForm />
      </div>
    </div>
  );
}
