// app/auctions/[id]/items/[itemId]/page.tsx
// Public page: show item details + bidding + real-time bid history + countdown timer

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import CountdownTimer from "./CountdownTimer";
import BidBox from "./BidBox";
import BidHistory from "./BidHistory";

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

export default async function ItemPage({ params }: any) {
  const { id: eventId, itemId } = await params;

  const supabase = await createClient();

  // Fetch auction event
  const { data: event } = await supabase
    .from("auction_events")
    .select("*")
    .eq("id", eventId)
    .single();

  // Fetch item
  const { data: item } = await supabase
    .from("auction_items")
    .select("*, consignor:consignor_id(username)")
    .eq("id", itemId)
    .eq("event_id", eventId)
    .single();

  // Fetch images
  const { data: images } = await supabase
    .from("item_images")
    .select("*")
    .eq("item_id", itemId)
    .order("is_primary", { ascending: false })
    .order("position", { ascending: true });

  if (!item) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <h1 className="text-2xl font-semibold">Item not found</h1>
        <p className="text-muted-foreground mt-2">
          This item does not exist or is not part of this auction.
        </p>
      </div>
    );
  }

  // Fetch highest bid
  const { data: latestBid } = await supabase
    .from("bids")
    .select("*")
    .eq("item_id", itemId)
    .order("amount", { ascending: false })
    .limit(1)
    .maybeSingle();

  const currentPrice = latestBid
    ? Number(latestBid.amount)
    : Number(item.starting_bid);

  // Load increment table
  const incrementTableId = event.increment_table_id;

  const { data: inc } = await supabase
    .from("bid_increments")
    .select("*")
    .eq("table_id", incrementTableId)
    .lte("min_amount", currentPrice)
    .or(`max_amount.is.null,max_amount.gte.${currentPrice}`)
    .order("min_amount", { ascending: false })
    .limit(1)
    .maybeSingle();

  const increment = inc ? Number(inc.increment) : 1;
  const nextMinBid = currentPrice + increment;

  // Fetch bid history
  const { data: bidHistory } = await supabase
    .from("bids")
    .select("*")
    .eq("item_id", itemId)
    .order("created_at", { ascending: false });

  return (
    <div className="p-6 space-y-8 max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <div className="text-sm text-muted-foreground space-x-1">
        <span>Auctions</span>
        <span>/</span>
        <span>{event?.title || `Auction #${eventId}`}</span>
        <span>/</span>
        <span className="text-foreground font-medium">
          {item.title || `Item #${itemId}`}
        </span>
      </div>

      {/* Title */}
      <h1 className="text-3xl font-semibold">{item.title}</h1>

      {/* Countdown Timer */}
      {event?.ends_at && (
        <CountdownTimer
          eventId={event.id}
          initialEndTime={event.ends_at}
        />
      )}

      {/* Description */}
      <p className="text-muted-foreground whitespace-pre-line">
        {item.description || "No description provided."}
      </p>

      {/* Consignor */}
      <div className="text-sm text-muted-foreground">
        Consignor: {item.consignor?.username || "Unknown"}
      </div>

      {/* Bidding UI */}
      <BidBox
        itemId={item.id}
        eventId={event.id}
        currentPrice={currentPrice}
        nextMinBid={nextMinBid}
      />

      {/* Real-time Bid History */}
      <BidHistory itemId={item.id} initialBids={bidHistory || []} />

      {/* Image gallery */}
      {Array.isArray(images) && images.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Images</h2>

          <div className="border rounded-lg overflow-hidden">
            <img
              src={images[0].url}
              alt="Primary image"
              className="w-full object-cover"
            />
          </div>

          {images.length > 1 && (
            <div className="grid grid-cols-3 gap-3">
              {images.map((img: any) => (
                <img
                  key={img.id}
                  src={img.url}
                  alt="Item image"
                  className="rounded border object-cover"
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
