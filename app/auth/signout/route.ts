import { createRouteHandlerClient } from "@/utils/supabase/route-client";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient();

  await supabase.auth.signOut();

  return NextResponse.redirect(new URL("/auth/login", request.url));
}
