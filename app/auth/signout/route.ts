// app/auth/signout/route.ts

import { createClient } from "@/utils/supabase/server-client";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient();

  await supabase.auth.signOut();

  return NextResponse.redirect(new URL("/auth/login", request.url));
}
