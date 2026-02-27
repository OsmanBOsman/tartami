// app/page.tsx
// Public Homepage – lists all auction events (Live, Upcoming, Ended)

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import Link from "next/link";

async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );
}

function computeStatus(event: any): string {
  const now = new Date();
  const start = event.starts_at ? new Date(event.starts_at) : null;
  const end = event.ends_at ? new Date(event.ends_at) : null;

  if (start && now < start) return "Upcoming";
  if (start && end && now >= start && now <= end) return "Live";
  if (end && now > end) return "Ended";

  return "Auction";
}

export default async function HomePage() {
  const supabase = await createClient();

  // Fetch all auction events
  const { data: events } = await supabase
    .from("auction_events")
    .select("*")
    .order("starts_at", { ascending: true });

  const live: any[] = [];
  const upcoming: any[] = [];
  const ended: any[] = [];

  for (const e of events || []) {
    const status = computeStatus(e);
    if (status === "Live") live.push(e);
    else if (status === "Upcoming") upcoming.push(e);
    else ended.push(e);
  }

  function StatusBadge({ status }: { status: string }) {
    return (
      <span
        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
          status === "Live"
            ? "bg-green-100 text-green-800"
            : status === "Upcoming"
            ? "bg-amber-100 text-amber-800"
            : status === "Ended"
            ? "bg-red-100 text-red-800"
            : "bg-muted text-muted-foreground"
        }`}
      >
        {status}
      </span>
    );
  }

  function AuctionList({ title, list }: any) {
    if (!list || list.length === 0) return null;

    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">{title}</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {list.map((event: any) => {
            const status = computeStatus(event);

            return (
              <Link
                key={event.id}
                href={`/auctions/${event.id}`}
                className="border rounded-lg p-4 hover:shadow transition space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="font-medium text-lg truncate">
                    {event.title || `Auction #${event.id}`}
                  </div>
                  <StatusBadge status={status} />
                </div>

                {event.description && (
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {event.description}
                  </p>
                )}

                <div className="text-xs text-muted-foreground space-y-1">
                  {event.starts_at && (
                    <div>
                      <span className="font-medium text-foreground">
                        Starts:
                      </span>{" "}
                      {new Date(event.starts_at).toLocaleString()}
                    </div>
                  )}
                  {event.ends_at && (
                    <div>
                      <span className="font-medium text-foreground">
                        Ends:
                      </span>{" "}
                      {new Date(event.ends_at).toLocaleString()}
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-10 max-w-6xl mx-auto">
      <h1 className="text-3xl font-semibold">Tartami Auctions</h1>

      {/* Live Auctions */}
      <AuctionList title="Live Auctions" list={live} />

      {/* Upcoming Auctions */}
      <AuctionList title="Upcoming Auctions" list={upcoming} />

      {/* Ended Auctions */}
      <AuctionList title="Past Auctions" list={ended} />

      {events?.length === 0 && (
        <p className="text-muted-foreground">No auctions available.</p>
      )}
    </div>
  );
}
