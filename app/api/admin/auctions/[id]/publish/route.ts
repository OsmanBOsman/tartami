// app/api/admin/auctions/[id]/publish/route.ts

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params; // ⭐ FIXED

  const supabase = await createClient();

  // Load event
  const { data: event, error: eventError } = await supabase
    .from("auction_events")
    .select("*")
    .eq("id", id)
    .single();

  if (eventError || !event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  // Load items
  const { data: items } = await supabase
    .from("auction_items")
    .select("id")
    .eq("event_id", id);

  const hasItems = items && items.length > 0;
  const hasTimes = event.starts_at && event.ends_at;

  if (!hasItems || !hasTimes || event.status !== "draft") {
    return NextResponse.json(
      { error: "Event cannot be published" },
      { status: 400 }
    );
  }

  // Update status → scheduled
  const { error: updateError } = await supabase
    .from("auction_events")
    .update({ status: "scheduled" })
    .eq("id", id);

  if (updateError) {
    return NextResponse.json(
      { error: updateError.message },
      { status: 500 }
    );
  }

  return NextResponse.redirect(
    new URL(`/admin/auctions/${id}`, req.url)
  );
}
