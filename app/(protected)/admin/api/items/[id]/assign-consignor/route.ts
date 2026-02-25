// app/(protected)/admin/api/items/[id]/assign-consignor/route.ts

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

// Create SSR client
async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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
  { params }: { params: { id: string } }
) {
  const supabase = await createClient();

  const form = await req.formData();
  const consignor_id = form.get("consignor_id");

  // Update the item with the new consignor
  await supabase
    .from("auction_items")
    .update({ consignor_id })
    .eq("id", params.id);

  // Redirect back to items list
  return NextResponse.redirect(req.headers.get("referer") || "/admin");
}
