import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

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

export default async function AdminAuctionEventPage({ params }: any) {
  const supabase = await createClient();

  const { data: event } = await supabase
    .from("auction_events")
    .select("*")
    .eq("id", params.id)
    .single();

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">{event.title}</h1>

      <div className="space-y-2">
        <div className="text-muted-foreground">{event.description}</div>
        <div>Type: {event.event_type}</div>
        <div>Status: {event.status}</div>
        <div>Starts: {event.start_at}</div>
        <div>Ends: {event.end_at}</div>
      </div>

      <div className="border-t pt-6">
        <h2 className="text-xl font-semibold">Items</h2>
        <p className="text-muted-foreground">Coming next…</p>
      </div>
    </div>
  );
}
