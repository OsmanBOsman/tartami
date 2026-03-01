// lib/getSession.ts
import { createSupabaseServerClient } from "@/lib/supabaseServer";

export async function getSession() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { supabase, session: null };
  }

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("full_name, approved, trusted, banned, is_admin")
    .eq("id", user.id)
    .single();

  const merged = {
    id: user.id,
    email: user.email ?? null,
    full_name: profile?.full_name ?? null,
    approved: profile?.approved ?? false,
    trusted: profile?.trusted ?? false,
    banned: profile?.banned ?? false,
    is_admin: profile?.is_admin ?? false,
  };

  return {
    supabase,
    session: merged,
  };
}
