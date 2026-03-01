// app/(protected)/admin/page.tsx
import { getSession } from "@/lib/getSession";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const { session, supabase } = await getSession();

  if (!session) {
    // Middleware should already handle this
    redirect("/auth/login");
  }

  const user = session.user;

  // Fetch profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // If user is not admin, redirect
  if (!profile?.admin) {
    redirect("/account");
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Admin Dashboard</h1>

      <p>Welcome, {user.email}</p>
      <p>You have admin access.</p>

      {/* Add your admin UI here */}
    </div>
  );
}
