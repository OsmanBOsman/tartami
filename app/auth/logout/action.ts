"use server";

import { createSupabaseServerClient } from "@/utils/supabase/create-server-client";
import { redirect } from "next/navigation";

export async function logout() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/auth/login");
}
