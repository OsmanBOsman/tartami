"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

type CountdownProps = {
  eventId: string;
  initialEndTime: string;
};

// -----------------------------
// Supabase client (client-side)
// -----------------------------
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

export default function CountdownTimer({ eventId, initialEndTime }: CountdownProps) {
  const initialEnd = new Date(initialEndTime);

  const [endTime, setEndTime] = useState<Date>(initialEnd);
  const [remaining, setRemaining] = useState<number>(
    Math.max(0, initialEnd.getTime() - Date.now())
  );

  const [extendedFlash, setExtendedFlash] = useState(false);

  useEffect(() => {
    const channel = supabase
      .channel(`auction-end:${eventId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "auction_events",
          filter: `id=eq.${eventId}`,
        },
        (payload) => {
          const updated = payload.new;

          if (updated?.ends_at) {
            const newEnd = new Date(updated.ends_at);

            if (newEnd.getTime() > endTime.getTime()) {
              setExtendedFlash(true);

              const audio = new Audio(
                "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAAZGF0YQAAAAA="
              );
              audio.play().catch(() => {});

              if (navigator.vibrate) navigator.vibrate(60);

              setTimeout(() => setExtendedFlash(false), 2000);
            }

            setEndTime(newEnd);
            setRemaining(Math.max(0, newEnd.getTime() - Date.now()));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [eventId, endTime]);

  useEffect(() => {
    const interval = setInterval(() => {
      const diff = endTime.getTime() - Date.now();
      setRemaining(Math.max(0, diff));
    }, 1000);

    return () => clearInterval(interval);
  }, [endTime]);

  if (remaining <= 0) {
    return (
      <div className="text-red-600 font-semibold text-lg">
        Auction Ended
      </div>
    );
  }

  const totalSeconds = Math.floor(remaining / 1000);
  const seconds = totalSeconds % 60;
  const minutes = Math.floor(totalSeconds / 60) % 60;
  const hours = Math.floor(totalSeconds / 3600);

  const isClosingSoon = remaining < 2 * 60 * 1000;

  return (
    <div className="space-y-1">
      {extendedFlash && (
        <div className="text-green-600 font-semibold text-sm animate-pulse">
          +2 minutes extended
        </div>
      )}

      <div
        className={`text-lg font-semibold ${
          isClosingSoon ? "text-red-600" : "text-foreground"
        }`}
      >
        Ends in:{" "}
        {hours > 0 && `${hours}h `}
        {minutes}m {seconds}s
      </div>
    </div>
  );
}
