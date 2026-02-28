// app/auctions/page.tsx
// Public Auctions Home Page – Tartami Auction Calendar

import Link from "next/link";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

// -----------------------------
// Supabase server client
// -----------------------------
async function createClient() {
  const cookieStorePromise = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        async get(name: string) {
          const store = await cookieStorePromise;
          return store.get(name)?.value;
        },
      },
    }
  );
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
export default async function AuctionsHomePage() {
  const supabase = await createClient();

  // Fetch all published auctions + their items + images
  const { data: events } = await supabase
    .from("auction_events")
    .select(
      `
      *,
      items:auction_items(
        id,
        status,
        images:item_images(url, is_primary)
      )
    `
    )
    .eq("status", "published")
    .order("starts_at", { ascending: true });

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-10">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold">Auctions</h1>
        <p className="text-muted-foreground">
          Explore live, upcoming, and past auctions on Tartami.
        </p>
      </div>

      {/* No auctions */}
      {(!events || events.length === 0) && (
        <div className="p-4 border rounded-lg text-muted-foreground">
          No auctions available yet.
        </div>
      )}

      {/* Auction Grid */}
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {events?.map((event: any) => {
          const status = computeStatus(event);

          // Find first approved item
          const firstItem = event.items?.find((i: any) => i.status === "approved");

          // Primary image from first approved item
          const primaryImage =
            firstItem?.images?.find((img: any) => img.is_primary) ||
            firstItem?.images?.[0] ||
            null;

          return (
            <Link
              key={event.id}
              href={`/auctions/${event.id}`}
              className="border rounded-lg overflow-hidden hover:shadow transition bg-white flex flex-col"
            >
              {/* Image */}
              <div className="aspect-video bg-black/5 overflow-hidden">
                {primaryImage ? (
                  <img
                    src={primaryImage.url}
                    alt={event.title || ""}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                    No image
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-4 space-y-3 flex-1 flex flex-col">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-lg truncate">
                    {event.title || `Auction #${event.id}`}
                  </h2>

                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium ${
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

                {/* Dates */}
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

                {/* Item count */}
                <div className="text-sm text-muted-foreground">
                  {event.items?.filter((i: any) => i.status === "approved").length || 0} items
                </div>

                <div className="mt-auto pt-3 text-blue-600 text-sm font-medium">
                  View auction →
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
