// app/auctions/[id]/items/[itemId]/page.tsx
// Public page: show item details

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

export default async function ItemPage({ params }: any) {
  const { id, itemId } = params; // ✅ SAFE in server components

  const supabase = await createClient();

  // Fetch item + consignor
  const { data: item } = await supabase
    .from("auction_items")
    .select("*, consignor:consignor_id(username)")
    .eq("id", itemId)
    .single();

  // Fetch images (primary first)
  const { data: images } = await supabase
    .from("item_images")
    .select("*")
    .eq("item_id", itemId)
    .order("is_primary", { ascending: false })
    .order("created_at", { ascending: true });

  return (
    <div className="p-6 space-y-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-semibold">{item.title}</h1>

      <p className="text-muted-foreground">{item.description}</p>

      <div className="text-lg font-medium">
        Starting Price: ${item.starting_price}
      </div>

      <div className="text-sm text-muted-foreground">
        Consignor: {item.consignor?.username || "Unknown"}
      </div>

      {/* Image gallery */}
      {Array.isArray(images) && images.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Images</h2>

          <div className="grid grid-cols-2 gap-4">
            {images.map((img: any) => (
              <img
                key={img.id}
                src={img.url}
                alt="Item image"
                className="rounded border"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
