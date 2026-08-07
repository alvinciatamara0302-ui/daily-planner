// The Productivity Dashboard: a summary of tasks, focus time, goals,
// and today's events. It reads everything from localStorage.
"use client";

import Link from "next/link";
import {
  CheckCircle2,
  Circle,
  Timer,
  Target,
  PartyPopper,
  type LucideIcon,
} from "lucide-react";
import {
  type Task,
  type Goal,
  type FocusSession,
  type CalendarEvent,
  STORAGE_KEYS,
  todayKey,
} from "@/lib/app-data";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { WeatherWidget } from "@/components/weather/weather-widget";

// A small reusable stat card (big number + label + icon).
function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 py-5">
        <div className="rounded-full bg-primary/10 p-3 text-primary">
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <div className="text-2xl font-bold">{value}</div>
          <div className="text-sm text-muted-foreground">{label}</div>
        </div>
      </CardContent>
    </Card>
  );
}

// Pick a greeting based on the time of day.
function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export function Dashboard() {
  const { value: tasks } = useLocalStorage<Task[]>(STORAGE_KEYS.tasks, []);
  const { value: goals } = useLocalStorage<Goal[]>(STORAGE_KEYS.goals, []);
  const { value: focusSessions } = useLocalStorage<FocusSession[]>(
    STORAGE_KEYS.focus,
    [],
  );
  const { value: events } = useLocalStorage<CalendarEvent[]>(
    STORAGE_KEYS.events,
    [],
  );

  const today = todayKey();

  // ---------- Numbers for the stat cards ----------
  const completed = tasks.filter((t) => t.completed).length;
  const remaining = tasks.filter((t) => !t.completed).length;
  const focusMinutes = focusSessions
    .filter((s) => s.date === today)
    .reduce((sum, s) => sum + s.minutes, 0);
  const goalsReached = goals.filter((g) => g.done).length;

  // Every task is done (and there's at least one) → celebrate!
  const allTasksDone = tasks.length > 0 && remaining === 0;

  // Top 5 unfinished tasks, highest priority first.
  const rank: Record<string, number> = { high: 0, medium: 1, low: 2 };
  const topTasks = tasks
    .filter((t) => !t.completed)
    .sort((a, b) => rank[a.priority] - rank[b.priority])
    .slice(0, 5);

  // Today's events, sorted by time.
  const todaysEvents = events
    .filter((e) => e.date === today)
    .sort((a, b) => (a.time || "99:99").localeCompare(b.time || "99:99"));

  return (
    <div className="space-y-6">
      {/* Greeting + weather side by side on wider screens */}
      <div className="grid items-center gap-4 md:grid-cols-2">
        <div>
          <h2 className="text-xl font-semibold">{greeting()}! 👋</h2>
          <p className="text-muted-foreground">
            Here&apos;s your day at a glance.
          </p>
        </div>
        <WeatherWidget />
      </div>

      {/* Celebration banner when all tasks are complete */}
      {allTasksDone && (
        <Card className="border-primary bg-primary/5">
          <CardContent className="flex items-center gap-3 py-4 text-primary">
            <PartyPopper className="h-6 w-6" />
            <span className="font-medium">
              You completed all your tasks. Great work today!
            </span>
          </CardContent>
        </Card>
      )}

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Tasks completed" value={completed} icon={CheckCircle2} />
        <StatCard label="Tasks remaining" value={remaining} icon={Circle} />
        <StatCard label="Focus minutes today" value={focusMinutes} icon={Timer} />
        <StatCard label="Goals reached" value={goalsReached} icon={Target} />
      </div>

      {/* Two columns: top tasks and today's events */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top tasks</CardTitle>
          </CardHeader>
          <CardContent>
            {topTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nothing pending.{" "}
                <Link href="/todo" className="text-primary underline">
                  Add a task
                </Link>
                .
              </p>
            ) : (
              <ul className="space-y-2">
                {topTasks.map((task) => (
                  <li
                    key={task.id}
                    className="flex items-center justify-between gap-2 text-sm"
                  >
                    <span className="truncate">{task.title}</span>
                    <Badge
                      variant={
                        task.priority === "high"
                          ? "destructive"
                          : task.priority === "medium"
                            ? "default"
                            : "secondary"
                      }
                    >
                      {task.priority}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Today&apos;s events</CardTitle>
          </CardHeader>
          <CardContent>
            {todaysEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No events today.{" "}
                <Link href="/calendar" className="text-primary underline">
                  Open calendar
                </Link>
                .
              </p>
            ) : (
              <ul className="space-y-2">
                {todaysEvents.map((event) => (
                  <li key={event.id} className="flex items-center gap-2 text-sm">
                    {event.time && (
                      <span className="font-mono text-xs text-muted-foreground">
                        {event.time}
                      </span>
                    )}
                    <span className="truncate">{event.title}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
