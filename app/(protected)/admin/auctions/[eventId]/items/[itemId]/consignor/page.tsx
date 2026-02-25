// app/(protected)/admin/auctions/[eventId]/items/[itemId]/consignor/page.tsx

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

// Create SSR client
async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );
}

export default async function AssignConsignorPage({ params }: any) {
  const supabase = await createClient();

  // Fetch item
  const { data: item } = await supabase
    .from("auction_items")
    .select("*")
    .eq("id", params.itemId)
    .single();

  // Fetch approved users
  const { data: users } = await supabase
    .from("user_profiles")
    .select("id, username")
    .eq("approved", true)
    .order("username");

  return (
    <div className="p-6 space-y-6 max-w-xl">
      <h1 className="text-2xl font-semibold">Assign Consignor</h1>

      <p className="text-muted-foreground">
        Item: <strong>{item.title}</strong>
      </p>

      <form
        action={`/admin/api/items/${item.id}/assign-consignor`}
        method="post"
        className="space-y-4"
      >
        <select
          name="consignor_id"
          className="w-full border p-2 rounded"
          defaultValue={item.consignor_id || ""}
        >
          <option value="">Select consignor</option>

          {users?.map((u: any) => (
            <option key={u.id} value={u.id}>
              {u.username}
            </option>
          ))}
        </select>

        <button
          className="px-4 py-2 bg-primary text-white rounded-md"
        >
          Save
        </button>
      </form>
    </div>
  );
}
