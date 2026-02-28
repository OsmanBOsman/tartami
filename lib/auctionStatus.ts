// lib/auctionStatus.ts

export type AuctionStatus = "draft" | "scheduled" | "live" | "ended";

/**
 * Computes the real-time status of an auction event.
 * This overrides the stored status when time boundaries are crossed.
 */
export function computeEventStatus(event: {
  status: AuctionStatus;
  starts_at: string | null;
  ends_at: string | null;
}): AuctionStatus {
  const now = new Date();

  const start = event.starts_at ? new Date(event.starts_at) : null;
  const end = event.ends_at ? new Date(event.ends_at) : null;

  // If timing isn't configured, event is still draft
  if (!start || !end) return "draft";

  if (now >= end) return "ended";
  if (now >= start) return "live";

  // If start is in the future
  return "scheduled";
}
