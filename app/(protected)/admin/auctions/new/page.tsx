"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

export default function NewAuctionEventPage() {
  const router = useRouter();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    title: "",
    description: "",
    event_type: "regular",
    starts_at: "",
    ends_at: "",
    increment_table_id: "",
    soft_close_window_seconds: 120,
    soft_close_extend_seconds: 120,
  });

  async function createEvent() {
    setLoading(true);
    setError("");

    if (!form.title || !form.starts_at || !form.ends_at) {
      setError("Title, start time, and end time are required.");
      setLoading(false);
      return;
    }

    const { error: insertError } = await supabase.from("auction_events").insert({
      title: form.title,
      description: form.description,
      event_type: form.event_type,
      starts_at: form.starts_at,
      ends_at: form.ends_at,
      increment_table_id: form.increment_table_id || null,
      soft_close_window_seconds: Number(form.soft_close_window_seconds),
      soft_close_extend_seconds: Number(form.soft_close_extend_seconds),
      status: "draft",
    });

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    router.push("/admin/auctions");
  }

  return (
    <div className="p-6 space-y-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-semibold">Create Auction Event</h1>

      <div className="space-y-4">
        <input
          className="w-full border p-2 rounded"
          placeholder="Event title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />

        <textarea
          className="w-full border p-2 rounded"
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />

        <select
          className="w-full border p-2 rounded"
          value={form.event_type}
          onChange={(e) => setForm({ ...form, event_type: e.target.value })}
        >
          <option value="regular">Regular</option>
          <option value="eid">Eid Premium Auction</option>
          <option value="summer">Summer Premium Auction</option>
        </select>

        <input
          type="datetime-local"
          className="w-full border p-2 rounded"
          value={form.starts_at}
          onChange={(e) => setForm({ ...form, starts_at: e.target.value })}
        />

        <input
          type="datetime-local"
          className="w-full border p-2 rounded"
          value={form.ends_at}
          onChange={(e) => setForm({ ...form, ends_at: e.target.value })}
        />

        <input
          className="w-full border p-2 rounded"
          placeholder="Increment Table ID (optional)"
          value={form.increment_table_id}
          onChange={(e) =>
            setForm({ ...form, increment_table_id: e.target.value })
          }
        />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-muted-foreground">
              Soft Close Window (seconds)
            </label>
            <input
              type="number"
              className="w-full border p-2 rounded"
              value={form.soft_close_window_seconds}
              onChange={(e) =>
                setForm({
                  ...form,
                  soft_close_window_seconds: Number(e.target.value),
                })
              }
            />
          </div>

          <div>
            <label className="text-sm text-muted-foreground">
              Soft Close Extend (seconds)
            </label>
            <input
              type="number"
              className="w-full border p-2 rounded"
              value={form.soft_close_extend_seconds}
              onChange={(e) =>
                setForm({
                  ...form,
                  soft_close_extend_seconds: Number(e.target.value),
                })
              }
            />
          </div>
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button
          onClick={createEvent}
          disabled={loading}
          className="px-4 py-2 bg-primary text-white rounded-md w-full"
        >
          {loading ? "Creating..." : "Create Event"}
        </button>
      </div>
    </div>
  );
}
