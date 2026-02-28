// app/(protected)/admin/components/AdminSidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminSidebar() {
  const pathname = usePathname();

  const link = (href: string, label: string) => {
    const active = pathname === href;
    return (
      <Link
        href={href}
        className={`block px-3 py-2 rounded-md text-sm ${
          active
            ? "bg-blue-600 text-white"
            : "text-gray-700 hover:bg-gray-200"
        }`}
      >
        {label}
      </Link>
    );
  };

  return (
    <aside className="w-64 border-r bg-white p-6 space-y-6">
      <div className="text-2xl font-bold">Tartami Admin</div>

      <nav className="space-y-2">
        {link("/admin", "Dashboard")}
        {link("/admin/auctions", "Auctions")}
        {link("/admin/items", "Items")}
        {link("/admin/users", "Users")}
      </nav>
    </aside>
  );
}
