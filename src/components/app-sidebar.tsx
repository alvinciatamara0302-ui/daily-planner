// The app's sidebar.
// - On desktop: a fixed column on the left.
// - On phones: a top bar with a ☰ button that opens a slide-in drawer.
//
// The mobile drawer is built with plain React state + a Tailwind slide
// animation (translate-x). We control it fully, so it's simple and reliable.
"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X, CalendarCheck } from "lucide-react";
import { SidebarNav } from "@/components/sidebar-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// A small reusable header showing the app name + logo icon.
function Brand() {
  return (
    <div className="flex items-center gap-2 px-3 py-1">
      <CalendarCheck className="h-6 w-6 text-primary" />
      <span className="text-lg font-bold">Daily Planner</span>
    </div>
  );
}

export function AppSidebar() {
  // Tracks whether the mobile drawer is open. `false` = closed.
  const [open, setOpen] = useState(false);

  // The current page URL, e.g. "/todo".
  const pathname = usePathname();

  // Whenever the page changes, close the mobile drawer.
  // This runs after every navigation, so tapping any link closes the menu.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Let the user press the Escape key to close the drawer.
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    // Cleanup: remove the listener when this component goes away.
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <>
      {/* ---------- DESKTOP SIDEBAR (hidden on small screens) ---------- */}
      <aside className="hidden w-64 shrink-0 border-r bg-sidebar md:flex md:flex-col">
        <div className="flex h-16 items-center border-b">
          <Brand />
        </div>
        {/* The nav links fill the middle and can scroll if long. */}
        <div className="flex-1 overflow-y-auto p-3">
          <SidebarNav />
        </div>
        {/* Theme toggle pinned to the bottom. */}
        <div className="border-t p-3">
          <ThemeToggle />
        </div>
      </aside>

      {/* ---------- MOBILE TOP BAR (hidden on desktop) ---------- */}
      <header className="flex h-16 items-center justify-between border-b px-4 md:hidden">
        <Brand />
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button
            variant="outline"
            size="icon"
            aria-label="Open menu"
            onClick={() => setOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* ---------- MOBILE DRAWER (hidden on desktop) ---------- */}
      {/* Backdrop: a dark layer behind the panel. Tapping it closes the menu.
          When closed we fade it out AND turn off pointer events so it can't
          block clicks on the page underneath. */}
      <div
        aria-hidden="true"
        onClick={() => setOpen(false)}
        className={cn(
          "fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 md:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />

      {/* The sliding panel itself. It's always in the page but pushed off
          to the left when closed, then slides into view when open.
          We use an inline `transform` style (instead of Tailwind's
          translate-x classes) so the slide is reliable and easy to follow:
          -100% hides it off the left edge; 0 brings it fully into view. */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        style={{
          transform: open ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 300ms ease-in-out",
        }}
        className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r bg-sidebar p-3 shadow-lg md:hidden"
      >
        <div className="mb-4 flex items-center justify-between">
          <Brand />
          <Button
            variant="ghost"
            size="icon"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        {/* The route-change effect above closes this drawer after a tap. */}
        <SidebarNav />
      </div>
    </>
  );
}
