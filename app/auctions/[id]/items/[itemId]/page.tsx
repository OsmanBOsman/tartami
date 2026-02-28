// app/auctions/[id]/items/[itemId]/page.tsx
// Public Item Page – Tartami premium item detail view

import { cookies } from "next/headers";
import { createSupabaseServerClient } from "@/utils/supabase/create-server-client";
import Link from "next/link";

// -----------------------------
// Tartami Increment Table
// -----------------------------
const TARTAMI_INCREMENTS = [
  { min: 0, max: 19, inc: 1 },
  { min: 20, max: 49, inc: 2 },
  { min: 50, max: 199, inc: 5 },
  { min: 200, max: 499, inc: 10 },
  { min: 500, max: 999, inc: 25 },
  { min: 1000, max: 4999, inc: 50 },
  { min: 5000, max: 9999, inc: 100 },
  { min: 10000, max: 24999, inc: 250 },
  { min: 25000, max: 49999, inc: 500 },
  { min: 50000, max: Infinity, inc: 1000 },
];

function getNextBid(current: number) {
  const row = TARTAMI_INCREMENTS.find(
    (r) => current >= r.min && current <= r.max
  );
  return current + (row?.inc ?? 1);
}

// -----------------------------
// Helpers
// -----------------------------
function computeStatus(event: any) {
  const now = new Date();
  const start = event.starts_at ? new Date(event.starts_at) : null;
  const end = event.ends_at ? new Date(event.ends_at) : null;

  if (start && now < start) return "Upcoming";
  if (start && end && now >= start && now <= end) return "Live";
  if (end && now > end) return "Ended";
  return "Auction";
}

function formatDate(d: string | null) {
  if (!d) return "";
  return new Date(d).toLocaleString();
}

// -----------------------------
// Page Component
// -----------------------------
export default async function PublicItemPage({
  params,
}: {
  params: { id: string; itemId: string };
}) {
  
  const supabase = await createSupabaseServerClient();

  const eventId = params.id;
  const itemId = params.itemId;

  // Fetch event
  const { data: event } = await supabase
    .from("auction_events")
    .select("*")
    .eq("id", eventId)
    .single();

  if (!event) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-semibold">Auction not found</h1>
        <p className="text-muted-foreground mt-2">
          This auction event does not exist or has been removed.
        </p>
      </div>
    );
  }

  const status = computeStatus(event);

  // Fetch item
  const { data: item } = await supabase
    .from("auction_items")
    .select("*, images:item_images(*)")
    .eq("id", itemId)
    .eq("event_id", eventId)
    .eq("status", "approved")
    .single();

  if (!item) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-semibold">Item not found</h1>
        <p className="text-muted-foreground mt-2">
          This item does not exist or is not approved for bidding.
        </p>
      </div>
    );
  }

  const primary =
    item.images?.find((img: any) => img.is_primary) || item.images?.[0];

  const currentPrice = Number(item.current_bid ?? item.starting_bid);
  const nextBid = getNextBid(currentPrice);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-10">
      {/* Breadcrumb */}
      <div className="text-sm text-muted-foreground">
        <Link href="/auctions" className="hover:underline">
          Auctions
        </Link>{" "}
        /{" "}
        <Link href={`/auctions/${eventId}`} className="hover:underline">
          {event.name}
        </Link>{" "}
        /{" "}
        <span className="text-foreground font-medium">{item.name}</span>
      </div>

      {/* Layout */}
      <div className="grid md:grid-cols-2 gap-10">
        {/* Image Gallery */}
        <div className="space-y-4">
          <div className="aspect-square bg-black/5 rounded-lg overflow-hidden flex items-center justify-center">
            {primary ? (
              <img
                src={primary.url}
                alt={item.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-muted-foreground text-sm">No image</span>
            )}
          </div>

          {/* Thumbnails */}
          {item.images && item.images.length > 1 && (
            <div className="grid grid-cols-4 gap-3">
              {item.images.map((img: any) => (
                <div
                  key={img.id}
                  className={`aspect-square rounded-lg overflow-hidden border ${
                    img.id === primary?.id
                      ? "border-blue-500"
                      : "border-transparent"
                  }`}
                >
                  <img
                    src={img.url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Item Info */}
        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold">{item.name}</h1>

            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                status === "Live"
                  ? "bg-green-100 text-green-800"
                  : status === "Upcoming"
                  ? "bg-amber-100 text-amber-800"
                  : status === "Ended"
                  ? "bg-red-100 text-red-800"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {status}
            </span>
          </div>

          {item.description && (
            <p className="text-muted-foreground whitespace-pre-line">
              {item.description}
            </p>
          )}

          {/* Pricing */}
          <div className="space-y-2">
            {status === "Upcoming" && (
              <div className="text-lg font-medium">
                Starting at ${Number(item.starting_bid).toFixed(2)}
              </div>
            )}

            {status === "Live" && (
              <div className="space-y-1">
                <div className="text-muted-foreground">
                  Current bid: ${currentPrice.toFixed(2)}
                </div>
                <div className="text-xl font-semibold text-blue-600">
                  Next bid: ${nextBid.toFixed(2)}
                </div>
              </div>
            )}

            {status === "Ended" && (
              <div className="text-lg font-medium">
                Final price: ${currentPrice.toFixed(2)}
              </div>
            )}
          </div>

          {/* CTA */}
          <div>
            {status === "Live" && (
              <button className="px-6 py-3 bg-blue-600 text-white rounded-md text-lg font-medium w-full">
                Place Bid
              </button>
            )}

            {status === "Upcoming" && (
              <div className="text-sm text-muted-foreground">
                Bidding opens at {formatDate(event.starts_at)}
              </div>
            )}

            {status === "Ended" && (
              <div className="text-sm text-muted-foreground">
                Bidding has ended.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
