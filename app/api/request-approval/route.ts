// app/api/request-approval/route.ts

import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@/utils/supabase/route-client";

export async function POST() {
  try {
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

    if (profile.approved) {
      return NextResponse.json(
        { error: "Your account is already approved." },
        { status: 400 }
      );
    }

    const missing =
      !profile.full_name ||
      !profile.username ||
      !profile.phone ||
      !profile.city ||
      !profile.neighborhood;

    if (missing) {
      return NextResponse.json(
        { error: "Complete your profile before requesting approval." },
        { status: 400 }
      );
    }

    // 3. Mark as pending approval
    const { error: updateError } = await supabase
      .from("user_profiles")
      .update({ approved: false })
      .eq("id", user.id);

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Approval requested. Admin will review your profile.",
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Unknown error" },
      { status: 500 }
    );
  }
}
