"use client";

import { useEffect, useState } from "react";
import { createClient, PostgrestSingleResponse } from "@supabase/supabase-js";

type BidBoxProps = {
  itemId: string;
  eventId: string; // <-- ADDED
  currentPrice: number;
  nextMinBid: number;
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

type BidIncrementRow = {
  increment: number;
};

type RealtimePayload = {
  new: {
    amount: number;
  };
};

export default function BidBox({
  itemId,
  eventId, // <-- ADDED
  currentPrice,
  nextMinBid,
}: BidBoxProps) {
  const [price, setPrice] = useState<number>(currentPrice);
  const [minBid, setMinBid] = useState<number>(nextMinBid);
  const [amount, setAmount] = useState<number>(nextMinBid);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // -----------------------------
  // REALTIME PRICE UPDATES
  // -----------------------------
  useEffect(() => {
    const channel = supabase
      .channel(`bids:${itemId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "bids",
          filter: `item_id=eq.${itemId}`,
        },
        async (payload: RealtimePayload) => {
          const newBid = payload.new.amount;
          const newPrice = Number(newBid);

          const { data }: PostgrestSingleResponse<BidIncrementRow | null> =
            await supabase
              .from("bid_increments")
              .select("*")
              .lte("min_amount", newPrice)
              .or(`max_amount.is.null,max_amount.gte.${newPrice}`)
              .order("min_amount", { ascending: false })
              .limit(1)
              .maybeSingle();

          const increment = data ? Number(data.increment) : 1;

          setPrice(newPrice);
          setMinBid(newPrice + increment);
          setAmount(newPrice + increment);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [itemId]);

  // -----------------------------
  // PLACE BID
  // -----------------------------
  async function placeBid() {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch("/api/bids", {
        method: "POST",
        body: JSON.stringify({
          itemId,
          amount: Number(amount),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Bid failed");
        if (data.minAllowed) {
          setAmount(data.minAllowed);
        }
        setLoading(false);
        return;
      }

      setMessage("Bid placed successfully!");
      setAmount(data.nextMinBid);
    } catch {
      setError("Something went wrong");
    }

    setLoading(false);
  }

  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div>
        <div className="text-xs uppercase tracking-wide text-muted-foreground">
          Current Price
        </div>
        <div className="text-2xl font-semibold">${price}</div>
      </div>

      <div>
        <div className="text-xs uppercase tracking-wide text-muted-foreground">
          Next Minimum Bid
        </div>
        <div className="text-sm font-medium">${minBid}</div>
      </div>

      <input
        type="number"
        className="w-full border rounded px-3 py-2"
        value={amount}
        min={minBid}
        onChange={(e) => setAmount(Number(e.target.value))}
      />

      <button
        onClick={placeBid}
        disabled={loading}
        className="w-full bg-primary text-primary-foreground rounded-md px-4 py-2 font-medium"
      >
        {loading ? "Placing bid..." : "Place Bid"}
      </button>

      {error && <p className="text-red-600 text-sm">{error}</p>}
      {message && <p className="text-green-600 text-sm">{message}</p>}
    </div>
  );
}
