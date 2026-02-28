// components/auth-button.tsx

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cookies } from "next/headers";
import { createSupabaseServerClient } from "@/utils/supabase/create-server-client";
import { LogoutButton } from "./logout-button";

export async function AuthButton() {
  
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user ? (
    <div className="flex items-center gap-4">
      Hey, {user.email}!
      <LogoutButton />
    </div>
  ) : (
    <div className="flex gap-2">
      <Button asChild size="sm" variant="outline">
        <Link href="/auth/login">Sign in</Link>
      </Button>
      <Button asChild size="sm" variant="default">
        <Link href="/auth/signup">Sign up</Link>
      </Button>
    </div>
  );
}
