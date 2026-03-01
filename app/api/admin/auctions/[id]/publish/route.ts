// app/api/admin/auctions/[id]/publish/route.ts

import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@/utils/supabase/route-client";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  const supabase = await createRouteHandlerClient(); // ⭐ FIX

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

  if (profile.banned) {
    return NextResponse.json(
      { error: "Your account is banned." },
      { status: 403 }
    );
  }

  if (!profile.is_admin) {
    return NextResponse.json(
      { error: "Admin access required." },
      { status: 403 }
    );
  }

  // 3. Load event
  const { data: event, error: eventError } = await supabase
    .from("auction_events")
    .select("*")
    .eq("id", id)
    .single();

  if (eventError || !event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  // 4. Load items
  const { data: items } = await supabase
    .from("auction_items")
    .select("id")
    .eq("event_id", id);

  const hasItems = items && items.length > 0;
  const hasTimes = event.starts_at && event.ends_at;

  // 5. Publish logic
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

  // 6. Unpublish logic
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

  return NextResponse.json(
    { error: "Ended events cannot be modified." },
    { status: 400 }
  );
}
