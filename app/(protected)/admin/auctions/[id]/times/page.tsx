// app/(protected)/admin/auctions/[id]/times/page.tsx

import { createClient } from "@/utils/supabase/server-client";
import Link from "next/link";

export default async function TimesEditorPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();

  // Load event
  const { data: event } = await supabase
    .from("auction_events")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!event) {
    return (
      <div className="p-6 text-center text-gray-500">
        Auction event not found.
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">
          Edit Times — {event.name}
        </h1>

        <Link
          href={`/admin/auctions/${params.id}`}
          className="text-sm underline text-gray-600"
        >
          Back
        </Link>
      </div>

      {/* Current Times */}
      <div className="border rounded-lg p-4 space-y-2">
        <h2 className="text-lg font-medium">Current Schedule</h2>

        <div className="text-sm text-gray-700">
          <div>
            <strong>Starts:</strong>{" "}
            {event.starts_at
              ? new Date(event.starts_at).toLocaleString()
              : "Not set"}
          </div>

          <div>
            <strong>Ends:</strong>{" "}
            {event.ends_at
              ? new Date(event.ends_at).toLocaleString()
              : "Not set"}
          </div>
        </div>
      </div>

      {/* Update Times Form */}
      <form
        action={`/api/admin/auctions/${params.id}/times`}
        method="POST"
        className="border rounded-lg p-4 space-y-4"
      >
        <h2 className="text-lg font-medium">Update Times</h2>

        <div className="space-y-1">
          <label className="text-sm font-medium">Start Time</label>
          <input
            type="datetime-local"
            name="starts_at"
            defaultValue={
              event.starts_at
                ? new Date(event.starts_at).toISOString().slice(0, 16)
                : ""
            }
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">End Time</label>
          <input
            type="datetime-local"
            name="ends_at"
            defaultValue={
              event.ends_at
                ? new Date(event.ends_at).toISOString().slice(0, 16)
                : ""
            }
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <p className="text-xs text-gray-500">
          You may update either field — both are optional.
        </p>

        <button className="px-4 py-2 bg-purple-600 text-white rounded-md">
          Save Changes
        </button>
      </form>
    </div>
  );
}
