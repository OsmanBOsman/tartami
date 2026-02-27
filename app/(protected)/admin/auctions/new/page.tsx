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

  const [form, setForm] = useState({
    title: "",
    description: "",
    event_type: "regular",
    start_at: "",
    end_at: "",
  });

  async function createEvent() {
    const { error } = await supabase.from("auction_events").insert({
      ...form,
      status: "draft",
    });

    if (!error) router.push("/admin/auctions");
  }

  return (
    <div className="p-6 space-y-6 max-w-xl">
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
          value={form.start_at}
          onChange={(e) => setForm({ ...form, start_at: e.target.value })}
        />

        <input
          type="datetime-local"
          className="w-full border p-2 rounded"
          value={form.end_at}
          onChange={(e) => setForm({ ...form, end_at: e.target.value })}
        />

        <button
          onClick={createEvent}
          className="px-4 py-2 bg-primary text-white rounded-md"
        >
          Create Event
        </button>
      </div>
    </div>
  );
}
