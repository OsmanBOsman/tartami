// components/Header.tsx
import Link from "next/link";
import Image from "next/image";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export default async function Header() {
  const cookieStore = await cookies();

  // READ‑ONLY Supabase client for Server Components
  const supabase = createServerClient(
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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="w-full border-b bg-white">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* LEFT — Tartami Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/tartami-logo.svg"
            alt="Tartami Logo"
            width={36}
            height={36}
            priority
          />
          <span className="text-2xl font-bold tracking-tight">Tartami</span>
        </Link>

        {/* CENTER — Somali / English toggle */}
        <div className="hidden sm:flex items-center gap-4 text-sm text-muted-foreground">
          <button className="hover:text-foreground transition">SO</button>
          <span>•</span>
          <button className="hover:text-foreground transition">EN</button>
        </div>

        {/* RIGHT — Auth */}
        <div className="flex items-center gap-4 text-sm">
          {!user && (
            <>
              <Link href="/auth/login" className="hover:underline">
                Login
              </Link>
              <Link
                href="/auth/signup"
                className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
              >
                Sign up
              </Link>
            </>
          )}

          {user && (
            <>
              <Link href="/account" className="hover:underline">
                {user.email}
              </Link>

              <form action="/auth/signout" method="post">
                <button
                  type="submit"
                  className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
                >
                  Logout
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
