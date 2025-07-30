import Link from "next/link";
import { Button } from "./ui/button";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "./logout-button";
import { User } from "lucide-react";

export async function AuthButton() {
  const supabase = await createClient();

  // You can also use getUser() which will be slower.
  const { data } = await supabase.auth.getClaims();

  const user = data?.claims;

  return user ? (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 text-white/90 text-sm">
        <div className="p-1 bg-white/20 rounded-full">
          <User className="h-4 w-4" />
        </div>
        <span className="hidden sm:block">{user.email}</span>
      </div>
      <LogoutButton />
    </div>
  ) : (
    <div className="flex gap-2">
      <Button asChild size="sm" variant="ghost" className="text-white hover:text-blue-100 hover:bg-white/10">
        <Link href="/auth/login">ログイン</Link>
      </Button>
      <Button asChild size="sm" className="bg-white text-blue-600 hover:bg-blue-50">
        <Link href="/auth/sign-up">新規登録</Link>
      </Button>
    </div>
  );
}
