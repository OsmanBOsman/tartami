// app/(protected)/admin/users/page.tsx
import { createRouteHandlerClient } from "@/utils/supabase/route-client";

interface UserProfile {
  id: string;
  full_name: string | null;
  username: string | null;
  phone: string | null;
  city: string | null;
  approved: boolean;
  trusted: boolean;
  banned: boolean;
  created_at: string;
}

export default async function AdminUsersPage() {
  const supabase = await createRouteHandlerClient();

  const { data: users } = await supabase
    .from("user_profiles")
    .select("*")
    .order("created_at", { ascending: false }) as { data: UserProfile[] | null };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">User Management</h1>

      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-200 text-left">
            <th className="p-2">Name</th>
            <th className="p-2">Username</th>
            <th className="p-2">Phone</th>
            <th className="p-2">City</th>
            <th className="p-2">Approved</th>
            <th className="p-2">Trusted</th>
            <th className="p-2">Banned</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>

        <tbody>
          {users?.map((u) => (
            <tr key={u.id} className="border-b">
              <td className="p-2">{u.full_name}</td>
              <td className="p-2">{u.username}</td>
              <td className="p-2">{u.phone}</td>
              <td className="p-2">{u.city}</td>
              <td className="p-2">{u.approved ? "Yes" : "No"}</td>
              <td className="p-2">{u.trusted ? "Yes" : "No"}</td>
              <td className="p-2">{u.banned ? "Yes" : "No"}</td>
              <td className="p-2">
                <a href={`/admin/users/${u.id}`} className="text-blue-600 underline">
                  Manage
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
