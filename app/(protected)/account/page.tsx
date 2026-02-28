// app/(protected)/account/page.tsx
import { createClient } from "@/utils/supabase/server-client";

export default async function AccountPage() {
  // Use the shared, correct SSR client
  const supabase = await createClient();

  // 1. Get authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 2. Fetch profile
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("full_name, approved, is_admin")
    .eq("id", user?.id)
    .single();

  return (
    <div className="p-10 space-y-6">
      <h1 className="text-2xl font-semibold">My Account</h1>

      <div className="space-y-2">
        <p><strong>Email:</strong> {user?.email}</p>
        <p><strong>Name:</strong> {profile?.full_name ?? "Not set"}</p>
        <p>
          <strong>Approval Status:</strong>{" "}
          {profile?.approved ? "Approved" : "Pending Approval"}
        </p>
        <p>
          <strong>Admin:</strong>{" "}
          {profile?.is_admin ? "Yes" : "No"}
        </p>
      </div>

      <div className="pt-4 space-y-3">
        <a
          href="/account/profile"
          className="text-blue-600 underline hover:text-blue-800"
        >
          Edit Profile
        </a>

        <form action="/auth/signout" method="post">
          <button
            type="submit"
            className="text-red-600 underline hover:text-red-800"
          >
            Log Out
          </button>
        </form>
      </div>
    </div>
  );
}
