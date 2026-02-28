// app/auctions/items/[itemId]/page.tsx

import { cookies } from "next/headers";
import { createSupabaseServerClient } from "@/utils/supabase/create-server-client";
import { ItemBiddingPanel } from "./ItemBiddingPanel";
import { BidHistoryPanel } from "./BidHistoryPanel";

export default async function ItemPage({
  params,
}: {
  params: { itemId: string; slug: string };
}) {
  const { itemId } = params;

  
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div>
      <h1>Item {itemId}</h1>

      <ItemBiddingPanel itemId={itemId} userId={user?.id} />

      <BidHistoryPanel itemId={itemId} />
    </div>
  );
}
