"use server";

import { createRouteHandlerClient } from "@/utils/supabase/route-client";
import { redirect } from "next/navigation";

export async function logout() {
  const supabase = await createRouteHandlerClient();

  await supabase.auth.signOut();

  // ⭐ Let middleware handle redirects
  redirect("/auth/login");
}
