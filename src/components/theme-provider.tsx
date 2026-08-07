// This file sets up light/dark mode for the whole app.
// "use client" tells Next.js this code runs in the browser,
// which is required because theming reacts to user clicks and
// reads/writes the saved theme in the browser.
"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ComponentProps } from "react";

// We wrap the library's provider in our own component so the rest
// of the app can simply import { ThemeProvider } from here.
// {...props} forwards any settings we pass in (like defaultTheme).
export function ThemeProvider({
  children,
  ...props
}: ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
