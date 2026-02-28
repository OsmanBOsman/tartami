'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'

export function useBidHistory(itemId: string) {
  const supabase = createSupabaseServerClient()
  const [history, setHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchHistory = useCallback(async () => {
    if (!itemId) return
    setLoading(true)

    const { data, error } = await supabase.rpc('get_bid_history_with_names', {
        p_item_id: itemId,
    })      

    if (!error && data) setHistory(data)
    setLoading(false)
  }, [supabase, itemId])

  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  // realtime updates
  useEffect(() => {
    if (!itemId) return

    const channel = supabase
      .channel(`bids-history:${itemId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'bids',
          filter: `item_id=eq.${itemId}`,
        },
        () => fetchHistory()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, itemId, fetchHistory])

  return { history, loading }
}
