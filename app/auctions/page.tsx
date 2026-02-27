// app/auctions/page.tsx
// Public page: list all auction events

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import Link from "next/link";

// Create SSR Supabase client
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

export default async function AuctionsPage() {
  const supabase = await createClient();

  // Fetch all published events
  const { data: events } = await supabase
    .from("auction_events")
    .select("*")
    .eq("status", "published")
    .order("start_at", { ascending: true });

  return (
    <div className="p-6 space-y-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-semibold">Auction Events</h1>

      <div className="border rounded-lg divide-y">
        {events?.map((event: any) => (
          <Link
            key={event.id}
            href={`/auctions/${event.id}`}
            className="block p-4 hover:bg-muted transition"
          >
            <div className="font-medium text-lg">{event.title}</div>
            <div className="text-sm text-muted-foreground">
              {event.event_type} • {new Date(event.start_at).toLocaleString()}
            </div>
          </Link>
        ))}

        {events?.length === 0 && (
          <div className="p-4 text-muted-foreground">No active auctions.</div>
        )}
      </div>
    </div>
  );
}
