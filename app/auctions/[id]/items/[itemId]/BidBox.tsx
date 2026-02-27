"use client";

import { useEffect, useState } from "react";
import { createClient, PostgrestSingleResponse } from "@supabase/supabase-js";

// Simple toast (no UI library needed)
function showToast(message: string) {
  const toast = document.createElement("div");
  toast.textContent = message;

  toast.style.position = "fixed";
  toast.style.bottom = "20px";
  toast.style.left = "50%";
  toast.style.transform = "translateX(-50%)";
  toast.style.background = "#333";
  toast.style.color = "white";
  toast.style.padding = "12px 18px";
  toast.style.borderRadius = "6px";
  toast.style.fontSize = "14px";
  toast.style.zIndex = "9999";
  toast.style.opacity = "0";
  toast.style.transition = "opacity 0.3s ease";

  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    toast.style.opacity = "1";
  });

  setTimeout(() => {
    toast.style.opacity = "0";
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}

type BidBoxProps = {
  itemId: string;
  eventId: string;
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
    bidder_id: string;
  };
};

export default function BidBox({
  itemId,
  eventId,
  currentPrice,
  nextMinBid,
}: BidBoxProps) {
  const [price, setPrice] = useState<number>(currentPrice);
  const [minBid, setMinBid] = useState<number>(nextMinBid);
  const [amount, setAmount] = useState<number>(nextMinBid);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isLeading, setIsLeading] = useState<boolean>(false);

  // -----------------------------
  // GET CURRENT USER
  // -----------------------------
  useEffect(() => {
    supabase.auth.getUser().then((res) => {
      setCurrentUserId(res.data.user?.id ?? null);
    });
  }, []);

  // -----------------------------
  // REALTIME PRICE + OUTBID + LEADING DETECTION
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
          const newBidAmount = Number(payload.new.amount);
          const newBidder = payload.new.bidder_id;

          // Fetch increment for new price
          const { data }: PostgrestSingleResponse<BidIncrementRow | null> =
            await supabase
              .from("bid_increments")
              .select("*")
              .lte("min_amount", newBidAmount)
              .or(`max_amount.is.null,max_amount.gte.${newBidAmount}`)
              .order("min_amount", { ascending: false })
              .limit(1)
              .maybeSingle();

          const increment = data ? Number(data.increment) : 1;

          // -----------------------------
          // OUTBID DETECTION
          // -----------------------------
          if (
            currentUserId &&
            newBidder !== currentUserId &&
            newBidAmount > price
          ) {
            // Fetch username of outbidder
            const { data: profile } = await supabase
              .from("profiles")
              .select("username")
              .eq("id", newBidder)
              .single();

            const username = profile?.username || "another bidder";

            // Toast
            showToast(`You’ve been outbid by ${username}.`);

            // Soft sound
            const audio = new Audio(
              "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAAZGF0YQAAAAA="
            );
            audio.play().catch(() => {});

            // Vibration (mobile)
            if (navigator.vibrate) {
              navigator.vibrate(80);
            }

            // User is no longer leading
            setIsLeading(false);
          }

          // -----------------------------
          // LEADING BIDDER DETECTION
          // -----------------------------
          if (currentUserId && newBidder === currentUserId) {
            setIsLeading(true);
          }

          // Update UI
          setPrice(newBidAmount);
          setMinBid(newBidAmount + increment);
          setAmount(newBidAmount + increment);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [itemId, price, currentUserId]);

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

      // User becomes leading bidder immediately after placing a valid bid
      setIsLeading(true);
    } catch {
      setError("Something went wrong");
    }

    setLoading(false);
  }

  return (
    <div className="border rounded-lg p-4 space-y-3">
      {isLeading && (
        <div className="text-green-600 font-medium text-sm">
          You are the leading bidder
        </div>
      )}

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
