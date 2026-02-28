'use client'

import { useRealtimeItemBidding } from './useRealtimeItemBidding'
import { supabaseBrowserClient } from '@/utils/supabase/client'

export function ItemBiddingPanel({
  itemId,
  userId,
}: {
  itemId: string
  userId?: string
}) {
  const supabase = supabaseBrowserClient
  const { state, loading, refresh } = useRealtimeItemBidding(itemId, userId)

  if (!userId) return <div>Please sign in to bid.</div>
  if (loading || !state) return <div>Loading bidding state…</div>
  if (state.error) return <div>Error: {state.error}</div>

  const canBid =
    state.is_auction_open &&
    state.is_user_approved &&
    !state.is_user_consignor

  return (
    <div>
      <div>Current bid: {state.current_bid}</div>
      <div>Next minimum bid: {state.next_minimum_bid}</div>
      <div>Increment step: {state.increment_step}</div>

      <button
        disabled={!canBid}
        onClick={async () => {
          const { error } = await supabase.rpc('place_bid', {
            p_item_id: itemId,
            p_user_id: userId,
            p_amount: state.next_minimum_bid,
          })
          if (error) alert(error.message)
        }}
      >
        Place bid at {state.next_minimum_bid}
      </button>

      <button onClick={refresh}>Manual refresh</button>
    </div>
  )
}
