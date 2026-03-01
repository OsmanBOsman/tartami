// app/(protected)/admin/page.tsx
import { getSession } from "@/lib/getSession";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const { session } = await getSession();

  if (!session) {
    redirect("/auth/login");
  }

  if (!session.is_admin) {
    redirect("/account");
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Admin Dashboard</h1>

      <p>Welcome, {session.email}</p>
      <p>You have admin access.</p>
    </div>
  );
}
