"use server";

import { createRouteHandlerClient } from "@/utils/supabase/route-client";
import { getSession } from "@/lib/getSession";
import { redirect } from "next/navigation";

export async function logout() {
  const supabase = await createRouteHandlerClient();

  await supabase.auth.signOut();

  // ⭐ Ensure cookies are fully cleared
  await getSession();

  // ⭐ Let middleware handle redirects
  redirect("/auth/login");
}
