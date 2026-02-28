import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@/utils/supabase/route-client";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  const supabase = createRouteHandlerClient();

  const form = await req.formData();
  const consignor_id = form.get("consignor_id");

  await supabase
    .from("auction_items")
    .update({ consignor_id })
    .eq("id", id);

  return NextResponse.redirect(req.headers.get("referer") || "/admin");
}
