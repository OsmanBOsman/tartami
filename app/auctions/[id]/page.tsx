// app/auctions/[id]/page.tsx
// Public page: show event details + approved items

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import Link from "next/link";

async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );
}

export default async function AuctionEventPage({ params }: any) {
  const supabase = await createClient();

  // Fetch event
  const { data: event } = await supabase
    .from("auction_events")
    .select("*")
    .eq("id", params.id)
    .single();

  // Fetch approved items for this event
  const { data: items } = await supabase
    .from("auction_items")
    .select("*, consignor:consignor_id(username)")
    .eq("event_id", params.id)
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  return (
    <div className="p-6 space-y-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-semibold">{event.title}</h1>

      <p className="text-muted-foreground">{event.description}</p>

      <h2 className="text-xl font-semibold pt-4">Items</h2>

      <div className="border rounded-lg divide-y">
        {items?.map((item: any) => (
          <Link
            key={item.id}
            href={`/auctions/${params.id}/items/${item.id}`}
            className="block p-4 hover:bg-muted transition"
          >
            <div className="font-medium">{item.title}</div>
            <div className="text-sm text-muted-foreground">
              Starting Price: ${item.starting_price}
            </div>
          </Link>
        ))}

        {items?.length === 0 && (
          <div className="p-4 text-muted-foreground">
            No approved items yet.
          </div>
        )}
      </div>
    </div>
  );
}
