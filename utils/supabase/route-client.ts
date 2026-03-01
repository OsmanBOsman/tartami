// utils/supabase/route-client.ts

import { createSupabaseServerClient } from "@/lib/supabaseServer";

export async function createRouteHandlerClient() {
  return createSupabaseServerClient();
}
