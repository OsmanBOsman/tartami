'use client'

import { useBidHistory } from './useBidHistory'

export function BidHistoryPanel({ itemId }: { itemId: string }) {
  const { history, loading } = useBidHistory(itemId)

  if (loading) return <div>Loading bid history…</div>

  if (!history.length)
    return <div>No bids yet. Be the first to bid!</div>

  return (
    <div style={{ marginTop: '1rem' }}>
      <h3>Bid History</h3>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {history.map((bid) => (
          <li
            key={bid.id}
            style={{
              padding: '0.5rem 0',
              borderBottom: '1px solid #eee',
            }}
          >
            <strong>${bid.amount}</strong>
            <div style={{ fontSize: '0.85rem', opacity: 0.7 }}>
              {bid.bidder_name ?? 'Unknown bidder'}
            </div>

            <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>
              {new Date(bid.created_at).toLocaleString()}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
