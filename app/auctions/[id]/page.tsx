// app/auctions/[id]/page.tsx
// Public Auction Page – shows event details + approved items

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

export default async function AuctionEventPage({ params }: any) {
  const supabase = await createClient();
  const eventId = params.id;

  // Fetch auction event
  const { data: event } = await supabase
    .from("auction_events")
    .select("*")
    .eq("id", eventId)
    .single();

  if (!event) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <h1 className="text-2xl font-semibold">Auction not found</h1>
        <p className="text-muted-foreground mt-2">
          This auction event does not exist or has been removed.
        </p>
      </div>
    );
  }

  // Fetch approved items + primary images
  const { data: items } = await supabase
    .from("auction_items")
    .select(
      "*, consignor:consignor_id(username), images:item_images(url, is_primary)"
    )
    .eq("event_id", eventId)
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  // Auction status helper
  function computeStatus(e: any): string {
    const now = new Date();
    const start = e.starts_at ? new Date(e.starts_at) : null;
    const end = e.ends_at ? new Date(e.ends_at) : null;

    if (start && now < start) return "Upcoming";
    if (start && end && now >= start && now <= end) return "Live";
    if (end && now > end) return "Ended";

    return "Auction";
  }

  const status = computeStatus(event);

  return (
    <div className="p-6 space-y-8 max-w-5xl mx-auto">
      {/* Breadcrumb */}
      <div className="text-sm text-muted-foreground">
        <span>Auctions</span> <span>/</span>{" "}
        <span className="text-foreground font-medium">
          {event.title || `Auction #${eventId}`}
        </span>
      </div>

      {/* Header */}
      <div className="space-y-3">
        <h1 className="text-3xl font-semibold">{event.title}</h1>

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
              {new Date(event.starts_at).toLocaleString()}
            </div>
          )}
          {event.ends_at && (
            <div>
              <span className="font-medium text-foreground">Ends:</span>{" "}
              {new Date(event.ends_at).toLocaleString()}
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

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {items?.map((item: any) => {
            const primary = item.images?.find((img: any) => img.is_primary);

            return (
              <Link
                key={item.id}
                href={`/auctions/${eventId}/items/${item.id}`}
                className="border rounded-lg overflow-hidden hover:shadow transition"
              >
                {/* Image */}
                <div className="aspect-square bg-black/5 flex items-center justify-center overflow-hidden">
                  {primary ? (
                    <img
                      src={primary.url}
                      alt={item.title}
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
                    {item.title || `Item #${item.id}`}
                  </div>

                  <div className="text-sm text-muted-foreground truncate">
                    Consignor: {item.consignor?.username || "Unknown"}
                  </div>

                  <div className="text-sm font-medium">
                    Starting: ${item.starting_price}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
