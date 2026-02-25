// app/(protected)/admin/auctions/[id]/items/page.tsx

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import Link from "next/link";

// Create SSR Supabase client using your cookie pattern
async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );
}

export default async function AuctionItemsPage({ params }: any) {
  const supabase = await createClient();

  // Fetch items for this event, including consignor info
  const { data: items } = await supabase
    .from("auction_items")
    .select("*, consignor:consignor_id(username)")
    .eq("event_id", params.id)
    .order("created_at", { ascending: false });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Items</h1>

        <Link
          href={`/admin/auctions/${params.id}/items/new`}
          className="px-4 py-2 bg-primary text-white rounded-md"
        >
          Add Item
        </Link>
      </div>

      <div className="border rounded-lg divide-y">
        {items?.map((item: any) => (
          <div key={item.id} className="p-4 space-y-2">
            <div className="font-medium">{item.title}</div>

            <div className="text-sm text-muted-foreground">
              Starting Price: ${item.starting_price}
            </div>

            <div className="text-sm text-muted-foreground">
              Status: {item.status}
            </div>

            {/* Consignor display */}
            <div className="text-sm">
              Consignor:{" "}
              {item.consignor?.username || (
                <span className="text-muted-foreground">None assigned</span>
              )}
            </div>

            {/* Assign consignor button */}
            <Link
              href={`/admin/auctions/${params.id}/items/${item.id}/consignor`}
              className="inline-block px-3 py-1 bg-blue-600 text-white rounded-md text-sm"
            >
              Assign Consignor
            </Link>

            {/* Images button */}
            <Link
              href={`/admin/auctions/${params.id}/items/${item.id}/images`}
              className="inline-block px-3 py-1 bg-purple-600 text-white rounded-md text-sm"
            >
              Upload Images
            </Link>



            
          </div>
        ))}

        {items?.length === 0 && (
          <div className="p-4 text-muted-foreground">No items yet.</div>
        )}
      </div>
    </div>
  );
}
