// app/(protected)/admin/api/items/[id]/reject/route.ts

import { createRouteHandlerClient } from "@/utils/supabase/route-client";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  context: { params: { id: string } }
) {
  const { id } = context.params;

  const supabase = createRouteHandlerClient();

  await supabase
    .from("auction_items")
    .update({ status: "rejected" })
    .eq("id", id);

  return NextResponse.redirect(req.headers.get("referer") || "/admin");
}
