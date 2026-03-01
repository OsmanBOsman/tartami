// utils/supabase/route-client.ts

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export async function createRouteHandlerClient() {
  const cookieStore = await cookies();

  const create = createServerClient as any;

  return create(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },

        // ⭐ REQUIRED FOR LOGIN
        setAll(cookiesToSet: { name: string; value: string; options: any }[]) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // ignore write errors in GET routes
          }
        },

        set(name: string, value: string, options: any) {
          try {
            cookieStore.set(name, value, options);
          } catch {}
        },

        remove(name: string, options: any) {
          try {
            cookieStore.set(name, "", { ...options, maxAge: 0 });
          } catch {}
        },
      },
    }
  );
}
