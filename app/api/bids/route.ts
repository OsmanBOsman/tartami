// app/api/bids/route.ts

import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@/utils/supabase/route-client";

// -----------------------------
// Tartami increments
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

function getIncrement(amount: number) {
  const row = TARTAMI_INCREMENTS.find(
    (r) => amount >= r.min && amount <= r.max
  );
  return row?.inc ?? 1;
}

// -----------------------------
// Soft-close settings
// -----------------------------
const SOFT_CLOSE_WINDOW_MS = 2 * 60 * 1000;
const SOFT_CLOSE_EXTENSION_MS = 2 * 60 * 1000;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { item_id } = body;

    if (!item_id) {
      return NextResponse.json({ error: "Missing item_id" }, { status: 400 });
    }

    const supabase = createRouteHandlerClient();

    // 1. Auth check
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // 2. Fetch profile
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("approved, banned")
      .eq("id", user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    if (profile.banned) {
      return NextResponse.json(
        { error: "Your account is banned" },
        { status: 403 }
      );
    }

    if (!profile.approved) {
      return NextResponse.json(
        { error: "Your account is not approved to bid" },
        { status: 403 }
      );
    }

    // 3. Fetch item + event
    const { data: item } = await supabase
      .from("auction_items")
      .select("*, event:auction_events(*), seller_id")
      .eq("id", item_id)
      .single();

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    if (item.seller_id === user.id) {
      return NextResponse.json(
        { error: "You cannot bid on your own item" },
        { status: 400 }
      );
    }

    const now = new Date();
    const start = new Date(item.event.starts_at);
    const end = new Date(item.event.ends_at);

    if (now < start) {
      return NextResponse.json(
        { error: "Auction has not started" },
        { status: 400 }
      );
    }

    if (now > end) {
      return NextResponse.json(
        { error: "Auction has ended" },
        { status: 400 }
      );
    }

    // 4. Latest bid
    const { data: latestBid } = await supabase
      .from("bids")
      .select("*")
      .eq("item_id", item_id)
      .order("amount", { ascending: false })
      .limit(1)
      .maybeSingle();

    const currentPrice = latestBid
      ? Number(latestBid.amount)
      : Number(item.starting_bid);

    const increment = getIncrement(currentPrice);
    const requiredMinBid = currentPrice + increment;

    // 5. Insert bid
    const { error: insertError } = await supabase.from("bids").insert({
      item_id,
      bidder_id: user.id,
      amount: requiredMinBid,
    });

    if (insertError) {
      return NextResponse.json(
        { error: insertError.message },
        { status: 400 }
      );
    }

    // 6. Soft-close extension
    const msRemaining = end.getTime() - now.getTime();

    if (msRemaining <= SOFT_CLOSE_WINDOW_MS) {
      const newEnd = new Date(end.getTime() + SOFT_CLOSE_EXTENSION_MS);

      await supabase
        .from("auction_events")
        .update({ ends_at: newEnd.toISOString() })
        .eq("id", item.event.id);
    }

    return NextResponse.json({
      success: true,
      amount: requiredMinBid,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Unknown error" },
      { status: 500 }
    );
  }
}
