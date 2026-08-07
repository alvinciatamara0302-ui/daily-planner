// The Pomodoro Timer: focus sessions with breaks.
// When a FOCUS session finishes, we record the minutes so the
// dashboard and weekly charts can show total focus time.
"use client";

import { useEffect, useState } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import {
  type FocusSession,
  STORAGE_KEYS,
  todayKey,
} from "@/lib/app-data";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// The three timer modes and how long each lasts (in seconds).
type Mode = "focus" | "short" | "long";
const DURATIONS: Record<Mode, number> = {
  focus: 25 * 60,
  short: 5 * 60,
  long: 15 * 60,
};
const MODE_LABEL: Record<Mode, string> = {
  focus: "Focus",
  short: "Short break",
  long: "Long break",
};

// Turn a number of seconds into "MM:SS".
function formatTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function PomodoroTimer() {
  // Which mode we're in, how many seconds remain, and whether it's ticking.
  const [mode, setMode] = useState<Mode>("focus");
  const [secondsLeft, setSecondsLeft] = useState(DURATIONS.focus);
  const [isRunning, setIsRunning] = useState(false);

  // Saved focus sessions (each is { date, minutes }).
  const { value: focusSessions, setValue: setFocusSessions } = useLocalStorage<
    FocusSession[]
  >(STORAGE_KEYS.focus, []);

  // The countdown. This effect re-runs every time `secondsLeft` changes.
  useEffect(() => {
    if (!isRunning) return; // paused: do nothing

    if (secondsLeft <= 0) {
      // ----- The timer reached zero -----
      setIsRunning(false);

      if (mode === "focus") {
        // Record the completed focus time for stats.
        setFocusSessions((prev) => [
          ...prev,
          { date: todayKey(), minutes: DURATIONS.focus / 60 },
        ]);
        toast.success("Focus session complete! Time for a break. 🎉");
        // Move on to a short break, ready to start.
        setMode("short");
        setSecondsLeft(DURATIONS.short);
      } else {
        toast("Break over — ready to focus again?");
        setMode("focus");
        setSecondsLeft(DURATIONS.focus);
      }
      return;
    }

    // Otherwise, tick down one second later.
    const timeoutId = setTimeout(() => {
      setSecondsLeft((s) => s - 1);
    }, 1000);
    // Cleanup cancels the pending tick if we pause or unmount.
    return () => clearTimeout(timeoutId);
  }, [isRunning, secondsLeft, mode, setFocusSessions]);

  // Switch mode (Focus / Short / Long). Resets the timer.
  function switchMode(next: Mode) {
    setMode(next);
    setSecondsLeft(DURATIONS[next]);
    setIsRunning(false);
  }

  // Reset the current mode's timer back to the start.
  function reset() {
    setSecondsLeft(DURATIONS[mode]);
    setIsRunning(false);
  }

  // Today's total focus minutes and number of sessions.
  const today = todayKey();
  const todaysSessions = focusSessions.filter((s) => s.date === today);
  const todaysMinutes = todaysSessions.reduce((sum, s) => sum + s.minutes, 0);

  return (
    <div className="mx-auto max-w-md space-y-6">
      {/* Mode switcher */}
      <div className="flex justify-center gap-2">
        {(Object.keys(DURATIONS) as Mode[]).map((m) => (
          <Button
            key={m}
            variant={mode === m ? "default" : "outline"}
            size="sm"
            onClick={() => switchMode(m)}
          >
            {MODE_LABEL[m]}
          </Button>
        ))}
      </div>

      {/* The big timer */}
      <Card>
        <CardContent className="flex flex-col items-center gap-6 py-10">
          <span className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
            {MODE_LABEL[mode]}
          </span>
          <div
            className={cn(
              "font-mono text-7xl font-bold tabular-nums",
              isRunning && "text-primary",
            )}
          >
            {formatTime(secondsLeft)}
          </div>
          <div className="flex gap-3">
            <Button
              size="lg"
              onClick={() => setIsRunning((r) => !r)}
              className="w-32"
            >
              {isRunning ? (
                <>
                  <Pause className="h-5 w-5" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="h-5 w-5" />
                  Start
                </>
              )}
            </Button>
            <Button size="lg" variant="outline" onClick={reset} aria-label="Reset">
              <RotateCcw className="h-5 w-5" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Today's focus summary */}
      <Card>
        <CardContent className="flex items-center justify-around py-4 text-center">
          <div>
            <div className="text-2xl font-bold">{todaysMinutes}</div>
            <div className="text-xs text-muted-foreground">minutes today</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{todaysSessions.length}</div>
            <div className="text-xs text-muted-foreground">sessions today</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
