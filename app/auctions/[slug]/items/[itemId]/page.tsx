import { ItemBiddingPanel } from './ItemBiddingPanel'
import { createClient } from '@/lib/supabase/server'

export default async function ItemPage({
  params,
}: {
  params: { itemId: string; slug: string }
}) {
  // IMPORTANT: createClient() returns a Promise
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div>
      <h1>Item {params.itemId}</h1>
      <ItemBiddingPanel itemId={params.itemId} userId={user?.id} />
    </div>
  )
}
