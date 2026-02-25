import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST() {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Fetch existing profile
  const { data: profile, error: profileError } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  // Block banned users
  if (profile.banned) {
    return NextResponse.json(
      { error: "Your account is banned." },
      { status: 403 }
    );
  }

  // Prevent re-requesting approval if already approved
  if (profile.approved) {
    return NextResponse.json(
      { error: "Your account is already approved." },
      { status: 400 }
    );
  }

  // Validate required fields before requesting approval
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

  // Mark as pending approval (approved = false)
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
}
