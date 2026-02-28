// app/page.tsx
// Tartami Public Home Page – premium Somali-rooted auction landing

import { createClient } from "@/utils/supabase/server-client";
import Link from "next/link";

// -----------------------------
// Helpers
// -----------------------------
function computeStatus(event: any) {
  const now = new Date();
  const start = event.starts_at ? new Date(event.starts_at) : null;
  const end = event.ends_at ? new Date(event.ends_at) : null;

  if (start && now < start) return "Upcoming";
  if (start && end && now >= start && now <= end) return "Live";
  if (end && now > end) return "Ended";
  return "Auction";
}

function formatDate(d: string | null) {
  if (!d) return "";
  return new Date(d).toLocaleString();
}

// -----------------------------
// Page Component
// -----------------------------
export default async function HomePage() {
  const supabase = await createClient();

  // Fetch published auctions + items + images
  const { data: events } = await supabase
    .from("auction_events")
    .select(
      `
      *,
      items:auction_items(
        id,
        status,
        images:item_images(url, is_primary)
      )
    `
    )
    .eq("status", "published")
    .order("starts_at", { ascending: true });

  const live = events?.filter((e) => computeStatus(e) === "Live") || [];
  const upcoming = events?.filter((e) => computeStatus(e) === "Upcoming") || [];
  const ended = events?.filter((e) => computeStatus(e) === "Ended") || [];

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-16">
      {/* Hero */}
      <section className="space-y-4 text-center py-10">
        <h1 className="text-4xl font-bold tracking-tight">
          Tartami – Premium Somali Auctions
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          A modern, trusted auction platform built for Somalia and the world.
          Bid with confidence. Sell with pride. Tartami.
        </p>

        <Link
          href="/auctions"
          className="inline-block mt-4 px-6 py-3 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition"
        >
          Browse Auctions
        </Link>
      </section>

      {/* LIVE AUCTIONS */}
      {live.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Live Auctions</h2>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {live.map((event: any) => {
              const firstItem = event.items?.find((i: any) => i.status === "approved");
              const primaryImage =
                firstItem?.images?.find((img: any) => img.is_primary) ||
                firstItem?.images?.[0] ||
                null;

              return (
                <Link
                  key={event.id}
                  href={`/auctions/${event.id}`}
                  className="border rounded-lg overflow-hidden hover:shadow transition bg-white flex flex-col"
                >
                  <div className="aspect-video bg-black/5 overflow-hidden">
                    {primaryImage ? (
                      <img
                        src={primaryImage.url}
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                        No image
                      </div>
                    )}
                  </div>

                  <div className="p-4 space-y-2 flex-1 flex flex-col">
                    <h3 className="font-semibold text-lg truncate">
                      {event.title}
                    </h3>

                    <div className="text-sm text-muted-foreground">
                      Ends: {formatDate(event.ends_at)}
                    </div>

                    <div className="mt-auto pt-3 text-blue-600 text-sm font-medium">
                      Enter auction →
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* UPCOMING AUCTIONS */}
      {upcoming.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Upcoming Auctions</h2>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {upcoming.map((event: any) => {
              const firstItem = event.items?.find((i: any) => i.status === "approved");
              const primaryImage =
                firstItem?.images?.find((img: any) => img.is_primary) ||
                firstItem?.images?.[0] ||
                null;

              return (
                <Link
                  key={event.id}
                  href={`/auctions/${event.id}`}
                  className="border rounded-lg overflow-hidden hover:shadow transition bg-white flex flex-col"
                >
                  <div className="aspect-video bg-black/5 overflow-hidden">
                    {primaryImage ? (
                      <img
                        src={primaryImage.url}
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                        No image
                      </div>
                    )}
                  </div>

                  <div className="p-4 space-y-2 flex-1 flex flex-col">
                    <h3 className="font-semibold text-lg truncate">
                      {event.title}
                    </h3>

                    <div className="text-sm text-muted-foreground">
                      Starts: {formatDate(event.starts_at)}
                    </div>

                    <div className="mt-auto pt-3 text-blue-600 text-sm font-medium">
                      View details →
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* RECENTLY ENDED */}
      {ended.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Recently Ended</h2>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {ended.map((event: any) => {
              const firstItem = event.items?.find((i: any) => i.status === "approved");
              const primaryImage =
                firstItem?.images?.find((img: any) => img.is_primary) ||
                firstItem?.images?.[0] ||
                null;

              return (
                <Link
                  key={event.id}
                  href={`/auctions/${event.id}`}
                  className="border rounded-lg overflow-hidden hover:shadow transition bg-white flex flex-col"
                >
                  <div className="aspect-video bg-black/5 overflow-hidden">
                    {primaryImage ? (
                      <img
                        src={primaryImage.url}
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                        No image
                      </div>
                    )}
                  </div>

                  <div className="p-4 space-y-2 flex-1 flex flex-col">
                    <h3 className="font-semibold text-lg truncate">
                      {event.title}
                    </h3>

                    <div className="text-sm text-muted-foreground">
                      Ended: {formatDate(event.ends_at)}
                    </div>

                    <div className="mt-auto pt-3 text-blue-600 text-sm font-medium">
                      View results →
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
