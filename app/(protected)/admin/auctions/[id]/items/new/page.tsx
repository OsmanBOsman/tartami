"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

export default function NewAuctionItemPage({ params }: { params: { id: string } }) {
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
    starting_bid: "",
    consignor_id: "",
  });

  const [nextPosition, setNextPosition] = useState(0);

  // Determine next position based on existing items
  useEffect(() => {
    async function fetchPosition() {
      const { data: items } = await supabase
        .from("auction_items")
        .select("id")
        .eq("event_id", params.id);

      setNextPosition(items?.length || 0);
    }

    fetchPosition();
  }, [params.id]);

  async function createItem() {
    setLoading(true);
    setError("");

    if (!form.title || !form.starting_bid) {
      setError("Title and starting bid are required.");
      setLoading(false);
      return;
    }

    const { error: insertError } = await supabase.from("auction_items").insert({
      event_id: params.id,
      title: form.title,
      description: form.description,
      starting_bid: Number(form.starting_bid),
      consignor_id: form.consignor_id || null,
      position: nextPosition,
      primary_image_url: null,
      status: "pending",
    });

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    router.push(`/admin/auctions/${params.id}/items`);
  }

  return (
    <div className="p-6 space-y-6 max-w-xl mx-auto">
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
          placeholder="Starting bid"
          value={form.starting_bid}
          onChange={(e) =>
            setForm({ ...form, starting_bid: e.target.value })
          }
        />

        <input
          className="w-full border p-2 rounded"
          placeholder="Consignor ID (optional)"
          value={form.consignor_id}
          onChange={(e) =>
            setForm({ ...form, consignor_id: e.target.value })
          }
        />

        <div className="text-sm text-muted-foreground">
          Position (auto): {nextPosition}
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button
          onClick={createItem}
          disabled={loading}
          className="px-4 py-2 bg-primary text-white rounded-md w-full"
        >
          {loading ? "Creating..." : "Create Item"}
        </button>
      </div>
    </div>
  );
}
