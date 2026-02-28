"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

type Bid = {
  id: string;
  amount: number;
  bidder_id: string;
  created_at: string;
};

type BidHistoryProps = {
  itemId: string;
  initialBids: Bid[];
};

// -----------------------------
// Supabase client (client-side)
// -----------------------------
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

export default function BidHistory({ itemId, initialBids }: BidHistoryProps) {
  const [bids, setBids] = useState<Bid[]>(initialBids);

  useEffect(() => {
    const channel = supabase
      .channel(`bids-history:${itemId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "bids",
          filter: `item_id=eq.${itemId}`,
        },
        (payload) => {
          const newBid = payload.new as Bid;

          setBids((prev) => {
            if (prev.some((b) => b.id === newBid.id)) return prev;
            return [newBid, ...prev];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [itemId]);

  return (
    <div className="border rounded-lg p-4 space-y-3 bg-white">
      <h2 className="text-lg font-semibold">Bid History</h2>

      {bids.length === 0 && (
        <p className="text-sm text-muted-foreground">No bids yet.</p>
      )}

      <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
        {bids.map((bid) => (
          <div
            key={bid.id}
            className="flex justify-between text-sm border-b pb-1"
          >
            <span className="font-medium">${Number(bid.amount).toFixed(2)}</span>
            <span className="text-muted-foreground">
              {new Date(bid.created_at).toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
