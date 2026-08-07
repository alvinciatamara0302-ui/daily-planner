import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { AppSidebar } from "@/components/app-sidebar";
import { AiAssistant } from "@/components/assistant/ai-assistant";

// Load two Google fonts. Each gives us a CSS variable we can use.
// Note: the variable is "--font-sans" so it matches globals.css.
const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// This is the text shown in the browser tab.
export const metadata: Metadata = {
  title: "Daily Planner",
  description: "Plan your day, stay focused, and get more done.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // suppressHydrationWarning is required by next-themes (see notes above).
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/* ThemeProvider makes light/dark mode available everywhere.
            - attribute="class": switches theme by adding a "dark" class
            - defaultTheme="system": follow the user's OS setting at first
            - enableSystem: allow the "system" option
            - disableTransitionOnChange: avoid a flicker when switching */}
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* The app frame: sidebar + main content.
              - flex-col on mobile (top bar stacked above content)
              - md:flex-row on desktop (sidebar beside content) */}
          <div className="flex min-h-screen flex-col md:flex-row">
            <AppSidebar />
            {/* Each page's content is shown here, inside <main>. */}
            <main className="flex-1 overflow-y-auto p-4 md:p-8">
              {children}
            </main>
          </div>
          {/* The AI assistant floats on every page. */}
          <AiAssistant />
          {/* Toaster renders the small pop-up notifications. */}
          <Toaster richColors position="top-center" />
        </ThemeProvider>
      </body>
    </html>
  );
}
