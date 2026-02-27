// app/(protected)/admin/api/items/[id]/assign-consignor/route.ts

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );
}

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  const supabase = await createClient();

  const form = await req.formData();
  const consignor_id = form.get("consignor_id");

  await supabase
    .from("auction_items")
    .update({ consignor_id })
    .eq("id", id);

  return NextResponse.redirect(req.headers.get("referer") || "/admin");
}
