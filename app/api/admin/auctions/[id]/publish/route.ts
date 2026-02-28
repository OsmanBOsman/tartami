// app/api/admin/auctions/[id]/publish/route.ts

import { createClient } from "@/utils/supabase/server-client";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  // Unified SSR Supabase client
  const supabase = await createClient();

  // 1. Auth check
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // 2. Load profile
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  // 3. Block banned users
  if (profile.banned) {
    return NextResponse.json(
      { error: "Your account is banned." },
      { status: 403 }
    );
  }

  // 4. Enforce admin role
  if (profile.role !== "admin") {
    return NextResponse.json(
      { error: "Admin access required." },
      { status: 403 }
    );
  }

  // 5. Load event
  const { data: event, error: eventError } = await supabase
    .from("auction_events")
    .select("*")
    .eq("id", id)
    .single();

  if (eventError || !event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  // 6. Load items
  const { data: items } = await supabase
    .from("auction_items")
    .select("id")
    .eq("event_id", id);

  const hasItems = items && items.length > 0;
  const hasTimes = event.starts_at && event.ends_at;

  // 7. Publish logic (draft → scheduled)
  if (event.status === "draft") {
    if (!hasItems || !hasTimes) {
      return NextResponse.json(
        { error: "Event cannot be published. Missing items or times." },
        { status: 400 }
      );
    }

    const { error: publishError } = await supabase
      .from("auction_events")
      .update({ status: "scheduled" })
      .eq("id", id);

    if (publishError) {
      return NextResponse.json(
        { error: publishError.message },
        { status: 500 }
      );
    }

    return NextResponse.redirect(new URL(`/admin/auctions/${id}`, req.url));
  }

  // 8. Unpublish logic (scheduled/live → draft)
  if (event.status === "scheduled" || event.status === "live") {
    const { error: unpublishError } = await supabase
      .from("auction_events")
      .update({ status: "draft" })
      .eq("id", id);

    if (unpublishError) {
      return NextResponse.json(
        { error: unpublishError.message },
        { status: 500 }
      );
    }

    return NextResponse.redirect(new URL(`/admin/auctions/${id}`, req.url));
  }

  // 9. Block unpublish after ended
  return NextResponse.json(
    { error: "Ended events cannot be modified." },
    { status: 400 }
  );
}
