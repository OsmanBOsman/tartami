"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

type CountdownProps = {
  eventId: string;
  initialEndTime: string;
};

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

export default function CountdownTimer({ eventId, initialEndTime }: CountdownProps) {
  const [endTime, setEndTime] = useState<Date>(new Date(initialEndTime));
  const [remaining, setRemaining] = useState<number>(
    Math.max(0, new Date(initialEndTime).getTime() - Date.now())
  );

  // -----------------------------
  // REALTIME END-TIME UPDATES
  // -----------------------------
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
          if (updated.ends_at) {
            const newEnd = new Date(updated.ends_at);
            setEndTime(newEnd);
            setRemaining(newEnd.getTime() - Date.now());
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [eventId]);

  // -----------------------------
  // LOCAL TICKING TIMER
  // -----------------------------
  useEffect(() => {
    const interval = setInterval(() => {
      const diff = endTime.getTime() - Date.now();
      setRemaining(diff);
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

  const seconds = Math.floor(remaining / 1000) % 60;
  const minutes = Math.floor(remaining / 1000 / 60) % 60;
  const hours = Math.floor(remaining / 1000 / 60 / 60);

  const isClosingSoon = remaining < 2 * 60 * 1000; // last 2 minutes

  return (
    <div
      className={`text-lg font-semibold ${
        isClosingSoon ? "text-red-600" : "text-foreground"
      }`}
    >
      Ends in: {hours > 0 && `${hours}h `}{minutes}m {seconds}s
    </div>
  );
}
