// "Today's AI Briefing" card: a short, friendly summary of the user's day.
// It generates once per day (cached in localStorage) and can be refreshed.
"use client";

import { useEffect, useRef, useState } from "react";
import { Sparkles, RefreshCw, Pencil, Check } from "lucide-react";
import {
  type Task,
  type Goal,
  type CalendarEvent,
  STORAGE_KEYS,
  todayKey,
} from "@/lib/app-data";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { getWeatherSummary } from "@/lib/weather";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Briefing = { date: string; text: string } | null;

export function AiBriefing() {
  // Cached briefing + the user's name + their data.
  const briefing = useLocalStorage<Briefing>(STORAGE_KEYS.briefing, null);
  const name = useLocalStorage<string>(STORAGE_KEYS.userName, "Alvincia");
  const tasks = useLocalStorage<Task[]>(STORAGE_KEYS.tasks, []);
  const goals = useLocalStorage<Goal[]>(STORAGE_KEYS.goals, []);
  const events = useLocalStorage<CalendarEvent[]>(STORAGE_KEYS.events, []);

  const [loading, setLoading] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const generatingRef = useRef(false);

  const today = todayKey();

  // True once everything has been read from the browser.
  const allLoaded =
    briefing.loaded &&
    name.loaded &&
    tasks.loaded &&
    goals.loaded &&
    events.loaded;

  const hasTodaysBriefing =
    briefing.value?.date === today && !!briefing.value?.text;

  // Ask the server to write a fresh briefing.
  async function generate() {
    setLoading(true);
    try {
      const weather = await getWeatherSummary();
      const todaysEvents = events.value.filter((e) => e.date === today);
      const res = await fetch("/api/briefing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.value,
          tasks: tasks.value,
          goals: goals.value,
          events: todaysEvents,
          weather,
        }),
      });
      const data = await res.json();
      briefing.setValue({ date: today, text: data.briefing });
    } catch {
      briefing.setValue({
        date: today,
        text: "Have a productive day! (Couldn't reach the AI just now.)",
      });
    } finally {
      setLoading(false);
    }
  }

  // Auto-generate today's briefing the first time we have all the data.
  useEffect(() => {
    if (!allLoaded || hasTodaysBriefing || generatingRef.current) return;
    generatingRef.current = true;
    generate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allLoaded, hasTodaysBriefing]);

  function saveName() {
    name.setValue(nameDraft.trim());
    setEditingName(false);
    // Regenerate so the greeting uses the new name.
    generate();
  }

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-500/15 via-fuchsia-500/10 to-blue-500/15 p-5 ring-1 ring-violet-500/20 backdrop-blur-md">
      {/* Decorative glow in the corner */}
      <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-violet-500/20 blur-3xl" />

      <div className="relative flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-blue-500 text-white shadow-md shadow-violet-500/30">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold leading-tight">Today&apos;s AI Briefing</h3>
            {/* Name editor */}
            {editingName ? (
              <div className="mt-1 flex items-center gap-1">
                <Input
                  value={nameDraft}
                  onChange={(e) => setNameDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") saveName();
                    if (e.key === "Escape") setEditingName(false);
                  }}
                  placeholder="Your name"
                  className="h-7 w-36 text-xs"
                  autoFocus
                />
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={saveName} aria-label="Save name">
                  <Check className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setNameDraft(name.value);
                  setEditingName(true);
                }}
                className="mt-0.5 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
              >
                {name.value ? `for ${name.value}` : "set your name"}
                <Pencil className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>

        {/* Refresh */}
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 shrink-0"
          onClick={generate}
          disabled={loading}
          aria-label="Refresh briefing"
        >
          <RefreshCw className={"h-4 w-4 " + (loading ? "animate-spin" : "")} />
        </Button>
      </div>

      {/* The briefing text */}
      <p className="relative mt-3 text-sm leading-relaxed text-foreground/90">
        {loading && !hasTodaysBriefing
          ? "Writing your briefing…"
          : briefing.value?.text || "Have a great day!"}
      </p>
    </div>
  );
}
