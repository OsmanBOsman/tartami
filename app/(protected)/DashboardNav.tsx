"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function DashboardNav() {
  const pathname = usePathname();

  const links = [
    { href: "/app", label: "Dashboard" },
    { href: "/app/account", label: "My Account" },
    // Future sections:
    // { href: "/app/bids", label: "My Bids" },
    // { href: "/app/items", label: "My Items" },
  ];

  return (
    <nav className="border-b bg-white">
      <div className="flex space-x-6 px-6 py-4">
        {links.map((link) => {
          const active = pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium ${
                active ? "text-black" : "text-gray-500 hover:text-black"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
