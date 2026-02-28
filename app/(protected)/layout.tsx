// app/(protected)/layout.tsx
import { createClient } from "@/utils/supabase/server-client";
import { redirect } from "next/navigation";
import DashboardNav from "./DashboardNav";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();

  // 1. Get user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 2. Fetch approval status
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("approved")
    .eq("id", user.id)
    .single();

  if (profile && !profile.approved) {
    redirect("/account/pending");
  }

  return (
    <div>
      <DashboardNav />
      {children}
    </div>
  );
}
