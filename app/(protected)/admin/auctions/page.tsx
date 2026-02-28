// app/(protected)/admin/auctions/page.tsx

import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

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

export default async function AdminAuctionsPage() {
  const supabase = await createClient();

  const { data: events } = await supabase
    .from("auction_events")
    .select("*, auction_items(count)")
    .order("starts_at", { ascending: false });

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Auction Events</h1>

        <Link
          href="/admin/auctions/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-md"
        >
          New Event
        </Link>
      </div>

      <div className="border rounded-lg divide-y">
        {events?.map((event: any) => {
          const status = computeStatus(event);
          const itemCount = event.auction_items?.[0]?.count ?? 0;

          const badgeClass =
            status === "Draft"
              ? "bg-gray-200 text-gray-800"
              : status === "Scheduled"
              ? "bg-blue-100 text-blue-800"
              : status === "Live"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800";

          return (
            <div
              key={event.id}
              className="p-4 flex items-center justify-between hover:bg-gray-50 transition"
            >
              <div>
                <div className="font-medium">{event.title}</div>

                <div className="text-sm text-gray-600 space-x-2">
                  <span className={`px-2 py-1 rounded text-xs ${badgeClass}`}>
                    {status}
                  </span>
                  <span>•</span>
                  <span>{itemCount} items</span>
                </div>

                <div className="text-xs text-gray-500 mt-1">
                  {event.starts_at && (
                    <span>
                      Starts: {new Date(event.starts_at).toLocaleString()}
                    </span>
                  )}
                  {event.ends_at && (
                    <>
                      <span> • </span>
                      <span>
                        Ends: {new Date(event.ends_at).toLocaleString()}
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href={`/admin/auctions/${event.id}/items`}
                  className="text-sm underline"
                >
                  Manage Items
                </Link>

                <Link
                  href={`/admin/auctions/${event.id}`}
                  className="text-sm underline"
                >
                  Edit
                </Link>
              </div>
            </div>
          );
        })}

        {events?.length === 0 && (
          <div className="p-4 text-gray-500">No events yet.</div>
        )}
      </div>
    </div>
  );
}
