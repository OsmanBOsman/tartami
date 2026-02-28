"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";

// -----------------------------
// Supabase client (client-side)
// -----------------------------
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// -----------------------------
// Tartami increments (cleaned)
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

export default function ItemClient({ event, item, bids, status, nextBid, eventId }: any) {
  const [currentBid, setCurrentBid] = useState(item.current_bid ?? item.starting_bid);
  const [bidHistory, setBidHistory] = useState(bids);
  const [isOutbid, setIsOutbid] = useState(false);
  const [loading, setLoading] = useState(false);

  // -----------------------------
  // Realtime subscription
  // -----------------------------
  useEffect(() => {
    const channel = supabase
      .channel(`bids:item:${item.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "bids",
          filter: `item_id=eq.${item.id}`,
        },
        (payload) => {
          const newBid = payload.new;

          setBidHistory((prev: any) => [newBid, ...prev]);

          if (newBid.amount > currentBid) {
            setCurrentBid(Number(newBid.amount));
            setIsOutbid(true);
            setTimeout(() => setIsOutbid(false), 2000);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [item.id, currentBid]);

  // -----------------------------
  // SECURE placeBid() using /api/bids
  // -----------------------------
  async function placeBid() {
    setLoading(true);

    try {
      const res = await fetch("/api/bids", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ item_id: item.id }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Bid failed");
        setLoading(false);
        return;
      }

      // Server returns validated bid amount
      const newAmount = Number(data.amount);

      setCurrentBid(newAmount);
      setBidHistory((prev: any) => [
        {
          id: crypto.randomUUID(),
          item_id: item.id,
          amount: newAmount,
          created_at: new Date().toISOString(),
        },
        ...prev,
      ]);
    } catch (err) {
      alert("Unexpected error placing bid");
    }

    setLoading(false);
  }

  const nextBidAmount = getNextBid(currentBid);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Back */}
      <Link href={`/auctions/${eventId}`} className="text-sm text-blue-600 hover:underline">
        ← Back to Auction
      </Link>

      {/* Title */}
      <h1 className="text-2xl font-semibold">{item.title}</h1>

      {/* Image */}
      <div className="aspect-square bg-black/5 rounded-lg overflow-hidden">
        {item.images?.[0] ? (
          <img
            src={item.images[0].url}
            alt={item.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            No image
          </div>
        )}
      </div>

      {/* Bid info */}
      <div className="space-y-2">
        <div className="text-lg font-medium">
          Current bid: ${Number(currentBid).toFixed(2)}
        </div>

        {status === "Live" && (
          <button
            onClick={placeBid}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            Bid ${nextBidAmount.toFixed(2)}
          </button>
        )}

        {status !== "Live" && (
          <div className="text-sm text-muted-foreground">
            Auction is not live.
          </div>
        )}

        {isOutbid && (
          <div className="text-red-600 text-sm font-medium">
            You’ve been outbid!
          </div>
        )}
      </div>

      {/* Description */}
      {item.description && (
        <p className="text-muted-foreground whitespace-pre-line">
          {item.description}
        </p>
      )}

      {/* Bid history */}
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Bid History</h2>

        {bidHistory.length === 0 && (
          <div className="text-muted-foreground text-sm">No bids yet.</div>
        )}

        <ul className="space-y-1">
          {bidHistory.map((b: any) => (
            <li key={b.id} className="text-sm">
              ${Number(b.amount).toFixed(2)} —{" "}
              {new Date(b.created_at).toLocaleString()}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
