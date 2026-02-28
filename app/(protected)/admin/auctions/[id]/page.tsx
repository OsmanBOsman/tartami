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

function computeStatus(event: any) {
  const now = new Date();
  const start = event.starts_at ? new Date(event.starts_at) : null;
  const end = event.ends_at ? new Date(event.ends_at) : null;

  if (!start || !end) return "Draft";
  if (now < start) return "Scheduled";
  if (now >= start && now <= end) return "Live";
  if (now > end) return "Ended";

  return "Draft";
}

export default async function AdminAuctionEventPage({ params }: any) {
  const supabase = await createClient();

  const { data: event } = await supabase
    .from("auction_events")
    .select("*")
    .eq("id", params.id)
    .single();

  const { data: itemsRaw } = await supabase
    .from("auction_items")
    .select("id")
    .eq("event_id", params.id);

  // ⭐ Normalize to always be an array
  const items = itemsRaw ?? [];

  const status = computeStatus(event);
  const hasItems = items.length > 0;
  const hasTimes = event.starts_at && event.ends_at;

  const canPublish = status === "Draft" && hasItems && hasTimes;

  return (
    <div className="p-6 space-y-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold">{event.title}</h1>

      <div className="space-y-2">
        <div className="text-muted-foreground">{event.description}</div>
        <div>Type: {event.event_type}</div>
        <div>Status: {status}</div>
        <div>Starts: {event.starts_at}</div>
        <div>Ends: {event.ends_at}</div>
      </div>

      <form
        action={`/api/admin/auctions/${params.id}/publish`}
        method="post"
        className="space-y-2"
      >
        <button
          type="submit"
          disabled={!canPublish}
          className="px-4 py-2 bg-green-600 text-white rounded-md disabled:opacity-50"
        >
          Publish Auction
        </button>

        {!hasItems && (
          <p className="text-xs text-muted-foreground">
            Add at least one item before publishing.
          </p>
        )}

        {!hasTimes && (
          <p className="text-xs text-muted-foreground">
            Set start and end times before publishing.
          </p>
        )}
      </form>

      <div className="border-t pt-6">
        <h2 className="text-xl font-semibold">Items</h2>
        <Link
          href={`/admin/auctions/${params.id}/items`}
          className="text-sm underline"
        >
          Manage Items
        </Link>
      </div>
    </div>
  );
}
