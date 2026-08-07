// A small button that switches between light and dark mode.
"use client";

import { Moon, Sun } from "lucide-react"; // two icons
import { useTheme } from "next-themes"; // reads/sets the theme
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  // `theme` is the current theme ("light" or "dark").
  // `setTheme` is the function we call to change it.
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="outline"
      size="icon"
      // If we're in dark mode, switch to light; otherwise switch to dark.
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      aria-label="Toggle theme" // helps screen readers
    >
      {/* Show the sun in light mode and the moon in dark mode.
          We use CSS classes so the icons swap smoothly. */}
      <Sun className="h-5 w-5 dark:hidden" />
      <Moon className="hidden h-5 w-5 dark:block" />
    </Button>
  );
}
