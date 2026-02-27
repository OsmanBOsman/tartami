"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

export default function NewAuctionItemPage({ params }: any) {
  const router = useRouter();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );

  const [form, setForm] = useState({
    title: "",
    description: "",
    starting_price: "",
  });

  async function createItem() {
    const { error } = await supabase.from("auction_items").insert({
      ...form,
      starting_price: Number(form.starting_price),
      event_id: params.id,
      status: "pending",
    });

    if (!error) router.push(`/admin/auctions/${params.id}/items`);
  }

  return (
    <div className="p-6 space-y-6 max-w-xl">
      <h1 className="text-2xl font-semibold">Add Item</h1>

      <div className="space-y-4">
        <input
          className="w-full border p-2 rounded"
          placeholder="Item title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />

        <textarea
          className="w-full border p-2 rounded"
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />

        <input
          type="number"
          className="w-full border p-2 rounded"
          placeholder="Starting price"
          value={form.starting_price}
          onChange={(e) =>
            setForm({ ...form, starting_price: e.target.value })
          }
        />

        <button
          onClick={createItem}
          className="px-4 py-2 bg-primary text-white rounded-md"
        >
          Create Item
        </button>
      </div>
    </div>
  );
}
