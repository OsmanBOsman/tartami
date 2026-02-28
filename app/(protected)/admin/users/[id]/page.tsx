// app/(protected)/admin/users/[id]/page.tsx
import { createClient } from "@/utils/supabase/create-server-client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export default async function AdminUserDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createSupabaseServerClient();

  // Fetch user profile
  const { data: user, error } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!user || error) {
    return <div className="p-6">User not found.</div>;
  }

  // Server actions
  async function updateField(formData: FormData) {
    "use server";
    const supabase = createSupabaseServerClient();

    const updates = {
      full_name: formData.get("full_name"),
      username: formData.get("username"),
      phone: formData.get("phone"),
      city: formData.get("city"),
      neighborhood: formData.get("neighborhood"),
      country: formData.get("country"),
    };

    await supabase.from("user_profiles").update(updates).eq("id", params.id);

    revalidatePath(`/admin/users/${params.id}`);
  }

  async function toggleApproval() {
    "use server";
    const supabase = createSupabaseServerClient();

    await supabase
      .from("user_profiles")
      .update({ approved: !user.approved })
      .eq("id", params.id);

    revalidatePath(`/admin/users/${params.id}`);
  }

  async function toggleTrusted() {
    "use server";
    const supabase = createSupabaseServerClient();

    await supabase
      .from("user_profiles")
      .update({ trusted: !user.trusted })
      .eq("id", params.id);

    revalidatePath(`/admin/users/${params.id}`);
  }

  async function toggleBanned() {
    "use server";
    const supabase = createSupabaseServerClient();

    await supabase
      .from("user_profiles")
      .update({ banned: !user.banned })
      .eq("id", params.id);

    revalidatePath(`/admin/users/${params.id}`);
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Manage User</h1>

      {/* STATUS */}
      <div className="space-y-2 mb-6">
        <p>
          <strong>Approved:</strong>{" "}
          {user.approved ? "Yes" : "No"}
        </p>
        <p>
          <strong>Trusted:</strong>{" "}
          {user.trusted ? "Yes" : "No"}
        </p>
        <p>
          <strong>Banned:</strong>{" "}
          {user.banned ? "Yes" : "No"}
        </p>

        <div className="flex gap-2 mt-4">
          <form action={toggleApproval}>
            <button
              className="px-4 py-2 bg-black text-white rounded"
              type="submit"
            >
              {user.approved ? "Revoke Approval" : "Approve User"}
            </button>
          </form>

          <form action={toggleTrusted}>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded"
              type="submit"
            >
              {user.trusted ? "Untrust" : "Mark Trusted"}
            </button>
          </form>

          <form action={toggleBanned}>
            <button
              className={`px-4 py-2 rounded ${
                user.banned
                  ? "bg-gray-600 text-white"
                  : "bg-red-600 text-white"
              }`}
              type="submit"
            >
              {user.banned ? "Unban" : "Ban User"}
            </button>
          </form>
        </div>
      </div>

      {/* EDIT FORM */}
      <form action={updateField} className="space-y-4">
        {[
          { key: "full_name", label: "Full Name" },
          { key: "username", label: "Username" },
          { key: "phone", label: "Phone" },
          { key: "city", label: "City" },
          { key: "neighborhood", label: "Neighborhood" },
          { key: "country", label: "Country" },
        ].map(({ key, label }) => (
          <div key={key}>
            <label className="block mb-1">{label}</label>
            <input
              type="text"
              name={key}
              defaultValue={user[key]}
              className="w-full border rounded px-3 py-2"
            />
          </div>
        ))}

        <button
          type="submit"
          className="px-4 py-2 bg-green-600 text-white rounded"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
}
