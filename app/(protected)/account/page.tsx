// app/(protected)/account/page.tsx
import { getSession } from "@/lib/getSession";

export default async function AccountPage() {
  const { session, supabase } = await getSession();

  if (!session) {
    // Middleware should already handle this, but this is a safe fallback
    return <div>Not authenticated</div>;
  }

  const user = session.user;

  // Fetch profile from your "profiles" table
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Account</h1>

      <div className="space-y-2">
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>User ID:</strong> {user.id}</p>

        {profile && (
          <>
            <p><strong>Approved:</strong> {profile.approved ? "Yes" : "No"}</p>
            <p><strong>Admin:</strong> {profile.admin ? "Yes" : "No"}</p>
          </>
        )}
      </div>
    </div>
  );
}
