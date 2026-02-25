// app/auctions/[id]/items/[itemId]/page.tsx
// Public page: show item details

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

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

export default async function ItemPage({ params }: any) {
  const supabase = await createClient();

  // Fetch item + consignor
  const { data: item } = await supabase
    .from("auction_items")
    .select("*, consignor:consignor_id(username)")
    .eq("id", params.itemId)
    .single();

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
    </div>
  );
}
