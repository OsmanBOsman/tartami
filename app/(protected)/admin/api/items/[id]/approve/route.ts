// app/(protected)/admin/api/items/[id]/approve/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server-client";

// Next.js 16 route handler signature
export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  // Unified SSR Supabase client
  const supabase = await createClient();

  // Approve the item
  await supabase
    .from("auction_items")
    .update({ status: "approved" })
    .eq("id", id);

  return NextResponse.redirect(req.headers.get("referer") || "/admin");
}
