// app/(protected)/admin/auctions/[id]/page.tsx

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

export default async function AdminAuctionDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();

  const { data: event } = await supabase
    .from("auction_events")
    .select("*, auction_items(count)")
    .eq("id", params.id)
    .single();

  if (!event) {
    return (
      <div className="p-6 text-center text-gray-500">
        Auction event not found.
      </div>
    );
  }

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
    <div className="p-6 space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{event.name}</h1>

        <Link
          href="/admin/auctions"
          className="text-sm underline text-gray-600"
        >
          Back
        </Link>
      </div>

      <div className="space-y-4 border rounded-lg p-4">
        <div className="flex items-center gap-3">
          <span className={`px-2 py-1 rounded text-xs ${badgeClass}`}>
            {status}
          </span>
          <span className="text-gray-600 text-sm">{itemCount} items</span>
        </div>

        <div className="text-sm text-gray-700">
          {event.description || "No description provided."}
        </div>

        <div className="text-xs text-gray-500 space-y-1">
          {event.starts_at && (
            <div>Starts: {new Date(event.starts_at).toLocaleString()}</div>
          )}
          {event.ends_at && (
            <div>Ends: {new Date(event.ends_at).toLocaleString()}</div>
          )}
        </div>
      </div>

      {/* ACTIONS */}
      <div className="space-y-4">
        {/* Publish / Unpublish */}
        {status === "Draft" || status === "Scheduled" ? (
          <form action={`/api/admin/auctions/${event.id}/publish`} method="POST">
            <button className="px-4 py-2 bg-green-600 text-white rounded-md">
              Publish Event
            </button>
          </form>
        ) : status === "Live" ? (
          <form
            action={`/api/admin/auctions/${event.id}/publish`}
            method="POST"
          >
            <input type="hidden" name="unpublish" value="true" />
            <button className="px-4 py-2 bg-yellow-600 text-white rounded-md">
              Unpublish Event
            </button>
          </form>
        ) : null}

        {/* Manage Items */}
        <Link
          href={`/admin/auctions/${event.id}/items`}
          className="block px-4 py-2 bg-blue-600 text-white rounded-md text-center"
        >
          Manage Items
        </Link>

        {/* Edit Times */}
        <Link
          href={`/admin/auctions/${event.id}/times`}
          className="block px-4 py-2 bg-purple-600 text-white rounded-md text-center"
        >
          Edit Times
        </Link>

        {/* Delete */}
        {status !== "Ended" && (
          <form
            action={`/api/admin/auctions/${event.id}/delete`}
            method="POST"
            onSubmit={(e) => {
              if (!confirm("Are you sure you want to delete this event?")) {
                e.preventDefault();
              }
            }}
          >
            <button className="px-4 py-2 bg-red-600 text-white rounded-md w-full">
              Delete Event
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
