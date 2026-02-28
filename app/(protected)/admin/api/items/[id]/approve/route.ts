// app/(protected)/admin/api/items/[id]/approve/route.ts

import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@/utils/supabase/route-client";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  const supabase = createRouteHandlerClient();

  await supabase
    .from("auction_items")
    .update({ status: "approved" })
    .eq("id", id);

  return NextResponse.redirect(req.headers.get("referer") || "/admin");
}
