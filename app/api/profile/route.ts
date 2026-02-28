// app/api/profile/route.ts

import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@/utils/supabase/route-client";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      full_name,
      username,
      phone,
      city,
      neighborhood,
      country,
      avatar_url,
    } = body;

    const supabase = await createRouteHandlerClient(); // ⭐ FIX

    // 1. Auth check
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // 2. Fetch profile
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

    // 3. Prevent editing locked fields after approval
    const tryingToChangeLockedFields =
      profile.approved &&
      (full_name !== profile.full_name || phone !== profile.phone);

    if (tryingToChangeLockedFields) {
      return NextResponse.json(
        {
          error:
            "You cannot change your full name or phone number after approval.",
        },
        { status: 400 }
      );
    }

    // 4. Update profile
    const { error: updateError } = await supabase
      .from("user_profiles")
      .update({
        full_name,
        username,
        phone,
        city,
        neighborhood,
        country,
        avatar_url,
      })
      .eq("id", user.id);

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Unknown error" },
      { status: 500 }
    );
  }
}
