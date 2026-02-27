"use client";

import { useState } from "react";

type BidBoxProps = {
  itemId: string;
  currentPrice: number;
  nextMinBid: number;
};

export default function BidBox({ itemId, currentPrice, nextMinBid }: BidBoxProps) {
  const [amount, setAmount] = useState<number>(nextMinBid);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

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
    } catch (err) {
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
        <div className="text-2xl font-semibold">${currentPrice}</div>
      </div>

      <div>
        <div className="text-xs uppercase tracking-wide text-muted-foreground">
          Next Minimum Bid
        </div>
        <div className="text-sm font-medium">${nextMinBid}</div>
      </div>

      <input
        type="number"
        className="w-full border rounded px-3 py-2"
        value={amount}
        min={nextMinBid}
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
