import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import DashboardNav from "./DashboardNav";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

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
