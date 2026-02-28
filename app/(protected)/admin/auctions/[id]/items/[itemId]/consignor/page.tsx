// app/(protected)/admin/auctions/[id]/items/[itemId]/consignor/page.tsx

import { createClient } from "@/utils/supabase/server-client";

export default async function AssignConsignorPage({ params }: any) {
  const { id, itemId } = params;

  // Unified SSR Supabase client
  const supabase = await createClient();

  const { data: item } = await supabase
    .from("auction_items")
    .select("*")
    .eq("id", itemId)
    .single();

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

        <button className="px-4 py-2 bg-primary text-white rounded-md">
          Save
        </button>
      </form>
    </div>
  );
}
