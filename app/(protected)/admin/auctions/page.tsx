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

export default async function AdminAuctionsPage() {
  const supabase = await createClient();

  const { data: events } = await supabase
    .from("auction_events")
    .select("*")
    .order("start_at", { ascending: false });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Auction Events</h1>
        <Link
          href="/admin/auctions/new"
          className="px-4 py-2 bg-primary text-white rounded-md"
        >
          New Event
        </Link>
      </div>

      <div className="border rounded-lg divide-y">
        {events?.map((event: any) => (
          <Link
            key={event.id}
            href={`/admin/auctions/${event.id}`}
            className="block p-4 hover:bg-muted transition"
          >
            <div className="font-medium">{event.title}</div>
            <div className="text-sm text-muted-foreground">
              {event.event_type} • {event.status}
            </div>
          </Link>
        ))}

        {events?.length === 0 && (
          <div className="p-4 text-muted-foreground">No events yet.</div>
        )}
      </div>
    </div>
  );
}
