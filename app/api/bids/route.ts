// app/api/bids/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

function createClient() {
  const cookieStorePromise = cookies(); // returns a Promise

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        async get(name: string) {
          const store = await cookieStorePromise; // await here
          return store.get(name)?.value;
        },
      },
    }
  );
}

// Helper: get increment for a given amount
async function getIncrement(supabase: any, tableId: string, amount: number) {
  const { data, error } = await supabase
    .from("bid_increments")
    .select("*")
    .eq("table_id", tableId)
    .lte("min_amount", amount)
    .or(`max_amount.is.null,max_amount.gte.${amount}`)
    .order("min_amount", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return 1;
  return Number(data.increment);
}

export async function POST(req: NextRequest) {
  const supabase = createClient();

  const { itemId, amount } = await req.json();

  if (!itemId || !amount) {
    return NextResponse.json(
      { error: "itemId and amount are required" },
      { status: 400 }
    );
  }

  // Get user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Load item + event
  const { data: item, error: itemError } = await supabase
    .from("auction_items")
    .select("*, event:auction_events(*), bids:bids(amount)")
    .eq("id", itemId)
    .single();

  if (itemError || !item) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }

  const event = item.event;

  if (!event) {
    return NextResponse.json(
      { error: "Auction event not found" },
      { status: 400 }
    );
  }

  // Validate auction timing
  const now = new Date();
  const startsAt = event.starts_at ? new Date(event.starts_at) : null;
  const endsAt = event.ends_at ? new Date(event.ends_at) : null;

  if (!startsAt || !endsAt) {
    return NextResponse.json(
      { error: "Auction timing not configured" },
      { status: 400 }
    );
  }

  if (now < startsAt) {
    return NextResponse.json(
      { error: "Auction has not started yet" },
      { status: 400 }
    );
  }

  if (now > endsAt) {
    return NextResponse.json(
      { error: "Auction has ended" },
      { status: 400 }
    );
  }

  // Determine current highest bid
  const { data: latestBid } = await supabase
    .from("bids")
    .select("*")
    .eq("item_id", itemId)
    .order("amount", { ascending: false })
    .limit(1)
    .maybeSingle();

  const currentAmount = latestBid
    ? Number(latestBid.amount)
    : Number(item.starting_bid);

  // Load increment table
  const incrementTableId = event.increment_table_id;

  if (!incrementTableId) {
    return NextResponse.json(
      { error: "No increment table assigned to this auction" },
      { status: 500 }
    );
  }

  const increment = await getIncrement(supabase, incrementTableId, currentAmount);

  const minAllowed =
    currentAmount === 0
      ? Number(item.starting_bid)
      : currentAmount + increment;

  if (amount < minAllowed) {
    return NextResponse.json(
      {
        error: "Bid too low",
        minAllowed,
      },
      { status: 400 }
    );
  }

  // -----------------------------
  // ⭐ 2-MINUTE SOFT CLOSE LOGIC
  // -----------------------------
  const windowSeconds = event.soft_close_window_seconds ?? 120;
  const extendSeconds = event.soft_close_extend_seconds ?? 120;

  const timeRemaining = (endsAt.getTime() - now.getTime()) / 1000;

  let extended = false;
  let newEnd = endsAt;

  if (timeRemaining <= windowSeconds) {
    newEnd = new Date(endsAt.getTime() + extendSeconds * 1000);

    await supabase
      .from("auction_events")
      .update({ ends_at: newEnd.toISOString() })
      .eq("id", event.id);

    extended = true;
  }

  // Insert bid
  const { data: bid, error: bidError } = await supabase
    .from("bids")
    .insert({
      item_id: itemId,
      bidder_id: user.id,
      amount,
    })
    .select()
    .single();

  if (bidError) {
    return NextResponse.json(
      { error: "Failed to place bid" },
      { status: 500 }
    );
  }

  // Update current price on item
  await supabase
    .from("auction_items")
    .update({ starting_bid: amount })
    .eq("id", itemId);

  return NextResponse.json(
    {
      success: true,
      bid,
      extended,
      newEndTime: newEnd,
      nextMinBid: amount + (await getIncrement(supabase, incrementTableId, amount)),
    },
    { status: 200 }
  );
}
