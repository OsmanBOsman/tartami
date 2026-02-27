// app/(protected)/admin/auctions/[id]/items/page.tsx

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import Link from "next/link";

async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );
}

export default async function AuctionItemsPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();

  // Fetch event info
  const { data: event } = await supabase
    .from("auction_events")
    .select("title")
    .eq("id", params.id)
    .single();

  // Fetch items for this event
  const { data: items } = await supabase
    .from("auction_items")
    .select(
      `
      id,
      title,
      starting_bid,
      position,
      primary_image_url,
      consignor:consignor_id(username)
    `
    )
    .eq("event_id", params.id)
    .order("position", { ascending: true });

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">
          Items for: {event?.title || "Auction"}
        </h1>

        <Link
          href={`/admin/auctions/${params.id}/items/new`}
          className="px-4 py-2 bg-primary text-white rounded-md"
        >
          Add Item
        </Link>
      </div>

      {/* Items List */}
      <div className="border rounded-lg divide-y">
        {items?.map((item) => (
          <div
            key={item.id}
            className="p-4 flex items-center justify-between hover:bg-muted transition"
          >
            {/* Left side: image + info */}
            <div className="flex items-center gap-4">
              {item.primary_image_url ? (
                <img
                  src={item.primary_image_url}
                  alt=""
                  className="w-16 h-16 object-cover rounded border"
                />
              ) : (
                <div className="w-16 h-16 bg-muted rounded border flex items-center justify-center text-xs text-muted-foreground">
                  No Image
                </div>
              )}

              <div>
                <div className="font-medium">{item.title}</div>

                <div className="text-sm text-muted-foreground">
                  Starting bid: ${item.starting_bid}
                </div>

                <div className="text-xs text-muted-foreground">
                  Position: {item.position}
                </div>

                <div className="text-sm">
                  Consignor:{" "}
                  {item.consignor?.[0]?.username || (
                    <span className="text-muted-foreground">None assigned</span>
                  )}
                </div>
              </div>
            </div>

            {/* Right side: actions */}
            <div className="flex items-center gap-3">
              <Link
                href={`/admin/auctions/${params.id}/items/${item.id}`}
                className="text-sm underline"
              >
                Edit
              </Link>

              <Link
                href={`/admin/auctions/${params.id}/items/${item.id}/images`}
                className="text-sm underline"
              >
                Images
              </Link>
            </div>
          </div>
        ))}

        {items?.length === 0 && (
          <div className="p-4 text-muted-foreground">No items yet.</div>
        )}
      </div>
    </div>
  );
}
