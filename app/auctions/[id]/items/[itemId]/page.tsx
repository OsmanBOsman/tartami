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
  const { id, itemId } = params; // auctionId = id

  const supabase = await createClient();

  // Fetch auction
  const { data: auction } = await supabase
    .from("auctions")
    .select("*")
    .eq("id", id)
    .single();

  // Fetch item + consignor
  const { data: item } = await supabase
    .from("auction_items")
    .select("*, consignor:consignor_id(username)")
    .eq("id", itemId)
    .eq("auction_id", id)
    .single();

  // Fetch images (primary first)
  const { data: images } = await supabase
    .from("item_images")
    .select("*")
    .eq("item_id", itemId)
    .order("is_primary", { ascending: false })
    .order("position", { ascending: true })
    .order("created_at", { ascending: true });

  if (!item) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <h1 className="text-2xl font-semibold">Item not found</h1>
        <p className="text-muted-foreground mt-2">
          This item does not exist or is not part of this auction.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <div className="text-sm text-muted-foreground space-x-1">
        <span>Auctions</span>
        <span>/</span>
        <span>{auction?.title || `Auction #${id}`}</span>
        <span>/</span>
        <span className="text-foreground font-medium">
          {item.title || `Item #${itemId}`}
        </span>
      </div>

      {/* Title */}
      <h1 className="text-3xl font-semibold">{item.title}</h1>

      {/* Description */}
      <p className="text-muted-foreground whitespace-pre-line">
        {item.description || "No description provided."}
      </p>

      {/* Price */}
      <div className="text-lg font-medium">
        Starting Price: ${item.starting_price}
      </div>

      {/* Consignor */}
      <div className="text-sm text-muted-foreground">
        Consignor: {item.consignor?.username || "Unknown"}
      </div>

      {/* Image gallery */}
      {Array.isArray(images) && images.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Images</h2>

          {/* Primary image */}
          <div className="border rounded-lg overflow-hidden">
            <img
              src={images[0].url}
              alt="Primary image"
              className="w-full object-cover"
            />
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="grid grid-cols-3 gap-3">
              {images.map((img: any) => (
                <img
                  key={img.id}
                  src={img.url}
                  alt="Item image"
                  className="rounded border object-cover"
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
