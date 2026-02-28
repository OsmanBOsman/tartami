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

// ⭐ POST → Add item
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const supabase = await createRouteHandlerClient(); // ⭐ FIX

  const admin = await getAdmin(supabase);
  if ("error" in admin)
    return NextResponse.json({ error: admin.error }, { status: admin.status });

  const event = await loadEvent(supabase, id);
  if (!event)
    return NextResponse.json({ error: "Event not found" }, { status: 404 });

  const body = await req.json();
  const { name, description, starting_bid, images } = body;

  if (!name || !starting_bid) {
    return NextResponse.json(
      { error: "Missing required fields: name, starting_bid" },
      { status: 400 }
    );
  }

  const { error: insertError } = await supabase.from("auction_items").insert({
    event_id: id,
    name,
    description: description || "",
    starting_bid,
    images: images || [],
  });

  if (insertError) {
    return NextResponse.json(
      { error: insertError.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}

// ⭐ PATCH → Edit item
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const supabase = await createRouteHandlerClient(); // ⭐ FIX

  const admin = await getAdmin(supabase);
  if ("error" in admin)
    return NextResponse.json({ error: admin.error }, { status: admin.status });

  const body = await req.json();
  const { item_id, ...updates } = body;

  if (!item_id) {
    return NextResponse.json(
      { error: "Missing item_id" },
      { status: 400 }
    );
  }

  const { error: updateError } = await supabase
    .from("auction_items")
    .update(updates)
    .eq("id", item_id)
    .eq("event_id", id);

  if (updateError) {
    return NextResponse.json(
      { error: updateError.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}

// ⭐ DELETE → Remove item
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const supabase = await createRouteHandlerClient(); // ⭐ FIX

  const admin = await getAdmin(supabase);
  if ("error" in admin)
    return NextResponse.json({ error: admin.error }, { status: admin.status });

  const body = await req.json();
  const { item_id } = body;

  if (!item_id) {
    return NextResponse.json(
      { error: "Missing item_id" },
      { status: 400 }
    );
  }

  const { error: deleteError } = await supabase
    .from("auction_items")
    .delete()
    .eq("id", item_id)
    .eq("event_id", id);

  if (deleteError) {
    return NextResponse.json(
      { error: deleteError.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}

// ⭐ PUT → Reorder items
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const supabase = await createRouteHandlerClient(); // ⭐ FIX

  const admin = await getAdmin(supabase);
  if ("error" in admin)
    return NextResponse.json({ error: admin.error }, { status: admin.status });

  const body = await req.json();
  const { order } = body;

  if (!Array.isArray(order)) {
    return NextResponse.json(
      { error: "order must be an array of item IDs" },
      { status: 400 }
    );
  }

  for (let i = 0; i < order.length; i++) {
    await supabase
      .from("auction_items")
      .update({ sort_order: i })
      .eq("id", order[i])
      .eq("event_id", id);
  }

  return NextResponse.json({ success: true });
}
