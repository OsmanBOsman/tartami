// utils/supabase/server-client.ts

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export function createClient() {
  // Force TS to stop treating cookies() as a Promise
  const cookieStore: any = cookies();

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
