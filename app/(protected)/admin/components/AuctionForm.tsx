// app/(protected)/admin/components/AuctionForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

export default function AuctionForm({
  mode,
  auction,
}: {
  mode: "create" | "edit";
  auction?: any;
}) {
  const router = useRouter();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );

  const [title, setTitle] = useState(auction?.title || "");
  const [description, setDescription] = useState(auction?.description || "");
  const [startsAt, setStartsAt] = useState(auction?.starts_at || "");
  const [endsAt, setEndsAt] = useState(auction?.ends_at || "");

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (mode === "create") {
      await supabase.from("auction_events").insert({
        title,
        description,
        starts_at: startsAt,
        ends_at: endsAt,
      });
    } else {
      await supabase
        .from("auction_events")
        .update({
          title,
          description,
          starts_at: startsAt,
          ends_at: endsAt,
        })
        .eq("id", auction.id);
    }

    router.push("/admin/auctions");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
      <div>
        <label className="block text-sm font-medium">Title</label>
        <input
          className="w-full border p-2 rounded"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Description</label>
        <textarea
          className="w-full border p-2 rounded"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Starts At</label>
        <input
          type="datetime-local"
          className="w-full border p-2 rounded"
          value={startsAt}
          onChange={(e) => setStartsAt(e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Ends At</label>
        <input
          type="datetime-local"
          className="w-full border p-2 rounded"
          value={endsAt}
          onChange={(e) => setEndsAt(e.target.value)}
        />
      </div>

      <button
        type="submit"
        className="px-4 py-2 bg-blue-600 text-white rounded-md"
      >
        {mode === "create" ? "Create Auction" : "Save Changes"}
      </button>
    </form>
  );
}
