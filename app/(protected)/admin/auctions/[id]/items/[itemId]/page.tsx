// app/(protected)/admin/auctions/[id]/items/[itemId]/page.tsx

import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@/utils/supabase/route-client";
import Link from "next/link";

export default async function EditItemPage({
  params,
}: {
  params: { id: string; itemId: string };
}) {
  
  const supabase = await createRouteHandlerClient();

  // Load event
  const { data: event } = await supabase
    .from("auction_events")
    .select("id, name")
    .eq("id", params.id)
    .single();

  if (!event) {
    return (
      <div className="p-6 text-center text-gray-500">
        Auction event not found.
      </div>
    );
  }

  // Load item
  const { data: item } = await supabase
    .from("auction_items")
    .select("*")
    .eq("id", params.itemId)
    .eq("event_id", params.id)
    .single();

  if (!item) {
    return (
      <div className="p-6 text-center text-gray-500">
        Item not found.
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">
          Edit Item — {item.name}
        </h1>

        <Link
          href={`/admin/auctions/${params.id}/items`}
          className="text-sm underline text-gray-600"
        >
          Back
        </Link>
      </div>

      {/* Edit Form */}
      <form
        action={`/api/admin/auctions/${params.id}/items`}
        method="POST"
        className="border rounded-lg p-4 space-y-4"
      >
        <input type="hidden" name="_method" value="PATCH" />
        <input type="hidden" name="item_id" value={item.id} />

        <div className="space-y-1">
          <label className="text-sm font-medium">Item Name</label>
          <input
            type="text"
            name="name"
            defaultValue={item.name}
            required
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Description</label>
          <textarea
            name="description"
            defaultValue={item.description || ""}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Starting Bid (USD)</label>
          <input
            type="number"
            name="starting_bid"
            defaultValue={item.starting_bid}
            required
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <button className="px-4 py-2 bg-blue-600 text-white rounded-md">
          Save Changes
        </button>
      </form>

      {/* Delete Item */}
      <form
        action={`/api/admin/auctions/${params.id}/items`}
        method="POST"
        onSubmit={(e) => {
          if (!confirm("Are you sure you want to delete this item?")) {
            e.preventDefault();
          }
        }}
      >
        <input type="hidden" name="_method" value="DELETE" />
        <input type="hidden" name="item_id" value={item.id} />

        <button className="px-4 py-2 bg-red-600 text-white rounded-md w-full">
          Delete Item
        </button>
      </form>
    </div>
  );
}
