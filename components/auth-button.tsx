'use client';

import Link from "next/link";
import { Button } from "./ui/button";
import { createClient } from "@/lib/supabase/client";
import { LogoutButton } from "./logout-button";
import { User } from "lucide-react";
import { useEffect, useState } from "react";
import type { User as SupabaseUser } from "@supabase/supabase-js";

export function AuthButton() {
  const [user, setUser] = useState<SupabaseUser | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };

    fetchUser();
  }, []);

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