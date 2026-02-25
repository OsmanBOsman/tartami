'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { RealtimePostgresInsertPayload } from '@supabase/supabase-js'

export function useRealtimeItemBidding(itemId: string, userId?: string) {
  const supabase = createClient()

  const [state, setState] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const fetchState = useCallback(async () => {
    if (!itemId || !userId) return
    setLoading(true)

    const { data, error } = await supabase.rpc('get_item_bid_state', {
      p_item_id: itemId,
      p_user_id: userId,
    })

    if (error) {
      setState({ error: error.message })
    } else {
      setState(data)
    }

    setLoading(false)
  }, [supabase, itemId, userId])

  useEffect(() => {
    fetchState()
  }, [fetchState])

  useEffect(() => {
    if (!itemId || !userId) return

    const channel = supabase
      .channel(`bids:item:${itemId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'bids',
          filter: `item_id=eq.${itemId}`,
        },
        (_payload: RealtimePostgresInsertPayload<any>) => {
          fetchState()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, itemId, userId, fetchState])

  return { state, loading, refresh: fetchState }
}
