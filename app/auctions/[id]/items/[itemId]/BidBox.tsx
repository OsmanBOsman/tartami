"use client";

import { useState } from "react";

type BidBoxProps = {
  itemId: string;
  currentPrice: number;
  nextMinBid: number;
  isLive: boolean;
};

export default function BidBox({
  itemId,
  currentPrice,
  nextMinBid,
  isLive,
}: BidBoxProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function placeBid() {
    if (!isLive) return;

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/bids", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ item_id: itemId }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Bid failed");
        setLoading(false);
        return;
      }

      setSuccess("Bid placed successfully!");
    } catch (err) {
      setError("Unexpected error placing bid");
    }

    setLoading(false);
  }

  return (
    <div className="border rounded-lg p-4 space-y-3 bg-white">
      <div>
        <div className="text-xs uppercase tracking-wide text-muted-foreground">
          Current Price
        </div>
        <div className="text-2xl font-semibold">
          ${currentPrice.toFixed(2)}
        </div>
      </div>

      <div>
        <div className="text-xs uppercase tracking-wide text-muted-foreground">
          Next Minimum Bid
        </div>
        <div className="text-sm font-medium">
          ${nextMinBid.toFixed(2)}
        </div>
      </div>

      <button
        onClick={placeBid}
        disabled={!isLive || loading}
        className="w-full bg-blue-600 text-white rounded-md px-4 py-2 font-medium disabled:opacity-50"
      >
        {loading ? "Placing bid..." : `Bid $${nextMinBid.toFixed(2)}`}
      </button>

      {error && <p className="text-red-600 text-sm">{error}</p>}
      {success && <p className="text-green-600 text-sm">{success}</p>}
    </div>
  );
}
