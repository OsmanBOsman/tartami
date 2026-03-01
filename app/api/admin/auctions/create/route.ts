// app/api/admin/auctions/create/route.ts

import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@/utils/supabase/route-client";

// Shared admin check
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
  if (!profile.is_admin)
    return { error: "Admin access required.", status: 403 };

  return { user, profile };
}

export async function POST(req: NextRequest) {
  const supabase = await createRouteHandlerClient(); // ⭐ FIX

  const admin = await getAdmin(supabase);
  if ("error" in admin)
    return NextResponse.json({ error: admin.error }, { status: admin.status });

  const body = await req.json();
  const { name, description, starts_at, ends_at, images } = body;

  if (!name || !starts_at || !ends_at) {
    return NextResponse.json(
      { error: "Missing required fields: name, starts_at, ends_at" },
      { status: 400 }
    );
  }

  const { data, error: insertError } = await supabase
    .from("auction_events")
    .insert({
      name,
      description: description || "",
      starts_at,
      ends_at,
      images: images || [],
      status: "draft",
    })
    .select()
    .single();

  if (insertError) {
    return NextResponse.json(
      { error: insertError.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, event: data });
}
