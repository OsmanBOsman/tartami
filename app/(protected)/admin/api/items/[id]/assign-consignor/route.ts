// app/(protected)/admin/api/items/[id]/assign-consignor/route.ts

import { createRouteHandlerClient } from "@/utils/supabase/route-client";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  context: { params: { id: string } }
) {
  const { id } = context.params;

  const supabase = createRouteHandlerClient();

  const form = await req.formData();
  const consignor_id = form.get("consignor_id");

  await supabase
    .from("auction_items")
    .update({ consignor_id })
    .eq("id", id);

  return NextResponse.redirect(req.headers.get("referer") || "/admin");
}
