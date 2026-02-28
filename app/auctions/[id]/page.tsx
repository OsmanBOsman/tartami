// app/auctions/[id]/page.tsx
// Public Auction Page – Tartami increments, clean CTA, production-ready

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
// Page
// -----------------------------
export default async function AuctionEventPage({
  params,
}: {
  params: { id: string };
}) {
  
  const supabase = await createSupabaseServerClient();

  const eventId = params.id;

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

  // Fetch items (approved only)
  const { data: items } = await supabase
    .from("auction_items")
    .select("*, images:item_images(*)")
    .eq("event_id", eventId)
    .eq("status", "approved")
    .order("position", { ascending: true });

  return (
    <div className="p-6 space-y-8 max-w-6xl mx-auto">
      {/* Breadcrumb */}
      <div className="text-sm text-muted-foreground">
        <Link href="/auctions" className="hover:underline">
          Auctions
        </Link>{" "}
        /{" "}
        <span className="text-foreground font-medium">
          {event.name || `Auction #${event.id}`}
        </span>
      </div>

      {/* Header */}
      <div className="space-y-3">
        <h1 className="text-3xl font-semibold">
          {event.name || `Auction #${event.id}`}
        </h1>

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

        {event.description && (
          <p className="text-muted-foreground whitespace-pre-line">
            {event.description}
          </p>
        )}

        <div className="text-sm text-muted-foreground space-y-1">
          {event.starts_at && (
            <div>
              <span className="font-medium text-foreground">Starts:</span>{" "}
              {formatDate(event.starts_at)}
            </div>
          )}
          {event.ends_at && (
            <div>
              <span className="font-medium text-foreground">Ends:</span>{" "}
              {formatDate(event.ends_at)}
            </div>
          )}
        </div>
      </div>

      {/* Items */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Items</h2>

        {(!items || items.length === 0) && (
          <div className="p-4 text-muted-foreground border rounded-lg">
            No approved items yet.
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {items?.map((item: any) => {
            const primary = item.images?.find((img: any) => img.is_primary);
            const currentPrice = Number(item.current_bid ?? item.starting_bid);
            const nextBid = getNextBid(currentPrice);

            return (
              <Link
                key={item.id}
                href={`/auctions/${eventId}/items/${item.id}`}
                className="border rounded-lg overflow-hidden hover:shadow transition bg-white"
              >
                {/* Image */}
                <div className="aspect-square bg-black/5 flex items-center justify-center overflow-hidden">
                  {primary ? (
                    <img
                      src={primary.url}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      No image
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="p-3 space-y-1">
                  <div className="font-medium truncate">
                    {item.name || `Item #${item.id}`}
                  </div>

                  {/* CTA Logic */}
                  {status === "Upcoming" && (
                    <div className="text-sm font-medium">
                      Starting at ${Number(item.starting_bid).toFixed(2)}
                    </div>
                  )}

                  {status === "Live" && (
                    <div className="space-y-1">
                      <div className="text-sm text-muted-foreground">
                        Current bid: ${currentPrice.toFixed(2)}
                      </div>
                      <div className="text-sm font-semibold text-blue-600">
                        Bid ${nextBid.toFixed(2)}
                      </div>
                    </div>
                  )}

                  {status === "Ended" && (
                    <div className="text-sm font-medium">
                      Final price: ${currentPrice.toFixed(2)}
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
