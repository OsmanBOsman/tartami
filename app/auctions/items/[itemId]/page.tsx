import { ItemBiddingPanel } from './ItemBiddingPanel'
import { BidHistoryPanel } from './BidHistoryPanel'
import { createClient } from '@/utils/supabase/server-client'

export default async function ItemPage({
  params,
}: {
  params: { itemId: string; slug: string }
}) {
  const { itemId } = params; // ✅ SAFE in server components

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div>
      <h1>Item {itemId}</h1>

      <ItemBiddingPanel itemId={itemId} userId={user?.id} />

      <BidHistoryPanel itemId={itemId} />
    </div>
  )
}
