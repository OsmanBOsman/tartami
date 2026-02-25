// app/(protected)/admin/components/AdminSidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminSidebar() {
  const pathname = usePathname();

  const links = [
    { href: "/admin/users", label: "Users" },
    { href: "/admin/auctions", label: "Auctions" },
    { href: "/admin/settings", label: "Settings" },
  ];

  return (
    <aside className="w-64 bg-white border-r p-4">
      <h2 className="text-xl font-bold mb-6">Admin</h2>

      <nav className="space-y-2">
        {links.map((link) => {
          const active = pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`block px-3 py-2 rounded ${
                active ? "bg-black text-white" : "hover:bg-gray-100"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
