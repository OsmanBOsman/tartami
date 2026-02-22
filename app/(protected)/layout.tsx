import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();

  // 1. Get the authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 2. Fetch the user's profile
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("approved")
    .eq("id", user.id)
    .single();

  // 3. If profile exists but is not approved → redirect
  if (profile && !profile.approved) {
    redirect("/account/pending");
  }

  return <>{children}</>;
}
