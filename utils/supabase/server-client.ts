// lib/supabase/server.ts

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

// Prevent async module inference by wrapping cookies()
function getCookieStore() {
  return cookies();
}

export function createClient() {
  const cookieStore = getCookieStore();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value ?? "";
        },
        // Server Components cannot modify cookies
        set() {},
        remove() {},
      },
    }
  );
}
