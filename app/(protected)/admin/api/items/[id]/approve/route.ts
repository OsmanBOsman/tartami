// app/(protected)/admin/api/items/[id]/approve/route.ts

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

// Create SSR Supabase client
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

// Next.js 16 route handler signature
export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params; // must await params

  const supabase = await createClient();

  // Approve the item
  await supabase
    .from("auction_items")
    .update({ status: "approved" })
    .eq("id", id);

  return NextResponse.redirect(req.headers.get("referer") || "/admin");
}
