// The list of navigation links used inside the sidebar (and the
// mobile drawer). It highlights whichever page you're currently on.
"use client";

import Link from "next/link"; // Next.js's fast page-to-page link
import { usePathname } from "next/navigation"; // tells us the current URL
import { navItems } from "@/lib/navigation";
import { cn } from "@/lib/utils"; // helper to combine class names

export function SidebarNav() {
  const pathname = usePathname(); // e.g. "/todo"

  return (
    <nav className="flex flex-col gap-1">
      {navItems.map((item) => {
        // Is this link the page we're currently viewing?
        const isActive = pathname === item.href;
        const Icon = item.icon; // the icon component for this item

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              // base styles for every link
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              // different look depending on active vs. not
              isActive
                ? "bg-gradient-to-r from-violet-600 to-indigo-500 text-white shadow-sm shadow-violet-500/30"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
            )}
          >
            <Icon className="h-5 w-5" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
