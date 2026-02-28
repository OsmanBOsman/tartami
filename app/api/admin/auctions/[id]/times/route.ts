// app/api/admin/auctions/[id]/times/route.ts

import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

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

// ⭐ PATCH → Update times (partial updates allowed)
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  // Unified SSR Supabase client
  const supabase = await createClient();

  // Auth
  const admin = await getAdmin(supabase);
  if ("error" in admin)
    return NextResponse.json({ error: admin.error }, { status: admin.status });

  // Load event
  const event = await loadEvent(supabase, id);
  if (!event)
    return NextResponse.json({ error: "Event not found" }, { status: 404 });

  // Parse body
  const body = await req.json();
  const { starts_at, ends_at } = body;

  if (!starts_at && !ends_at) {
    return NextResponse.json(
      { error: "Provide at least one field: starts_at or ends_at" },
      { status: 400 }
    );
  }

  // Build update object
  const updates: any = {};
  if (starts_at) updates.starts_at = starts_at;
  if (ends_at) updates.ends_at = ends_at;

  // Update event
  const { error: updateError } = await supabase
    .from("auction_events")
    .update(updates)
    .eq("id", id);

  if (updateError) {
    return NextResponse.json(
      { error: updateError.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
