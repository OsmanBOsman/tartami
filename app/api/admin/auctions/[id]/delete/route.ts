// app/api/admin/auctions/[id]/delete/route.ts

import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@/utils/supabase/route-client";

// ⭐ Shared auth + admin check
async function getAdmin(supabase: any) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated", status: 401 };

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) return { error: "Profile not found", status: 404 };
  if (profile.banned) return { error: "Your account is banned.", status: 403 };
  if (profile.role !== "admin")
    return { error: "Admin access required.", status: 403 };

  return { user, profile };
}

// ⭐ Load event helper
async function loadEvent(supabase: any, id: string) {
  const { data: event, error } = await supabase
    .from("auction_events")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !event) return null;
  return event;
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  const supabase = createRouteHandlerClient();

  const admin = await getAdmin(supabase);
  if ("error" in admin)
    return NextResponse.json({ error: admin.error }, { status: admin.status });

  const event = await loadEvent(supabase, id);
  if (!event)
    return NextResponse.json({ error: "Event not found" }, { status: 404 });

  if (event.status === "ended") {
    return NextResponse.json(
      { error: "Ended auctions cannot be deleted." },
      { status: 400 }
    );
  }

  await supabase.from("auction_items").delete().eq("event_id", id);

  const { error: deleteError } = await supabase
    .from("auction_events")
    .delete()
    .eq("id", id);

  if (deleteError) {
    return NextResponse.json(
      { error: deleteError.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
