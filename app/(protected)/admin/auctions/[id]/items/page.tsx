// app/(protected)/admin/auctions/[id]/items/page.tsx

import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function ItemsManagerPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();

  // Load event
  const { data: event } = await supabase
    .from("auction_events")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!event) {
    return (
      <div className="p-6 text-center text-gray-500">
        Auction event not found.
      </div>
    );
  }

  // Load items
  const { data: items } = await supabase
    .from("auction_items")
    .select("*")
    .eq("event_id", params.id)
    .order("sort_order", { ascending: true });

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">
          Items for: {event.name}
        </h1>

        <Link
          href={`/admin/auctions/${params.id}`}
          className="text-sm underline text-gray-600"
        >
          Back
        </Link>
      </div>

      {/* Add Item Form */}
      <form
        action={`/api/admin/auctions/${params.id}/items`}
        method="POST"
        className="border rounded-lg p-4 space-y-3"
      >
        <h2 className="text-lg font-medium">Add New Item</h2>

        <input
          type="text"
          name="name"
          placeholder="Item name"
          required
          className="w-full border rounded px-3 py-2"
        />

        <textarea
          name="description"
          placeholder="Description (optional)"
          className="w-full border rounded px-3 py-2"
        />

        <input
          type="number"
          name="starting_bid"
          placeholder="Starting bid (USD)"
          required
          className="w-full border rounded px-3 py-2"
        />

        <button className="px-4 py-2 bg-blue-600 text-white rounded-md">
          Add Item
        </button>
      </form>

      {/* Items List */}
      <div className="border rounded-lg divide-y">
        {items?.map((item: any) => (
          <div
            key={item.id}
            className="p-4 flex items-center justify-between hover:bg-gray-50 transition"
          >
            <div>
              <div className="font-medium">{item.name}</div>
              <div className="text-sm text-gray-600">
                Starting bid: ${item.starting_bid}
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Edit link */}
              <Link
                href={`/admin/auctions/${params.id}/items/${item.id}`}
                className="text-sm underline"
              >
                Edit
              </Link>

              {/* Delete form */}
              <form
                action={`/api/admin/auctions/${params.id}/items`}
                method="POST"
                onSubmit={(e) => {
                  if (!confirm("Delete this item?")) e.preventDefault();
                }}
              >
                <input type="hidden" name="_method" value="DELETE" />
                <input type="hidden" name="item_id" value={item.id} />

                <button className="text-sm text-red-600 underline">
                  Delete
                </button>
              </form>
            </div>
          </div>
        ))}

        {items?.length === 0 && (
          <div className="p-4 text-gray-500">No items yet.</div>
        )}
      </div>
    </div>
  );
}
