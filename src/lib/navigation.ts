// This file lists every page in the sidebar.
// To add a new page later, just add one item to this array.

import {
  LayoutDashboard,
  ListChecks,
  Calendar,
  Target,
  StickyNote,
  Timer,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";

// A "type" describes the shape of each nav item so TypeScript
// can catch typos (e.g. a missing href) before we run the app.
export type NavItem = {
  label: string; // the text shown in the sidebar
  href: string; // the page URL this link goes to
  icon: LucideIcon; // the little picture next to the label
};

export const navItems: NavItem[] = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "To-Do", href: "/todo", icon: ListChecks },
  { label: "Calendar", href: "/calendar", icon: Calendar },
  { label: "Goals", href: "/goals", icon: Target },
  { label: "Notes", href: "/notes", icon: StickyNote },
  { label: "Pomodoro", href: "/pomodoro", icon: Timer },
  { label: "Weekly", href: "/weekly", icon: TrendingUp },
];
