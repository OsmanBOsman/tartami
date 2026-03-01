// middleware.ts
import { NextResponse, NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value, options } of cookiesToSet) {
            res.cookies.set(name, value, options);
          }
        },
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const pathname = req.nextUrl.pathname;

  // Public routes
  const isAuthRoute = pathname.startsWith("/auth");

  // Protected routes
  const isProtected =
    pathname.startsWith("/account") || pathname.startsWith("/admin");

  // If user is not logged in and tries to access protected pages
  if (!session && isProtected) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  // If user is logged in and tries to access /auth pages
  if (session && isAuthRoute) {
    return NextResponse.redirect(new URL("/account", req.url));
  }

  return res;
}

export const config = {
  matcher: ["/account/:path*", "/admin/:path*", "/auth/:path*"],
};
