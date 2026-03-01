// app/(protected)/admin/layout.tsx

import { createRouteHandlerClient } from "@/utils/supabase/route-client";
import AdminSidebar from "./components/AdminSidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createRouteHandlerClient(); // ⭐ FIXED

  // 1. Get authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-semibold">Unauthorized</h1>
        <p className="text-muted-foreground mt-2">
          Please log in to access the admin dashboard.
        </p>
      </div>
    );
  }

  // 2. Fetch admin flag
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-semibold">Access Denied</h1>
        <p className="text-muted-foreground mt-2">
          You do not have admin permissions.
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-6 bg-gray-50">{children}</main>
    </div>
  );
}
