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
import { AiBriefing } from "@/components/dashboard/ai-briefing";
import { cn } from "@/lib/utils";

// A small reusable stat card. `color` gives each card its own accent.
function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 py-5">
        <div className={cn("rounded-xl p-3", color)}>
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
      {/* Today's AI Briefing — the friendly daily summary */}
      <AiBriefing />

      {/* Celebration banner when all tasks are complete */}
      {allTasksDone && (
        <div className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-emerald-500/15 to-teal-500/15 p-4 text-emerald-700 ring-1 ring-emerald-500/20 dark:text-emerald-300">
          <PartyPopper className="h-6 w-6" />
          <span className="font-medium">
            You completed all your tasks. Great work today!
          </span>
        </div>
      )}

      {/* Stat cards — each with its own color */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Tasks completed"
          value={completed}
          icon={CheckCircle2}
          color="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
        />
        <StatCard
          label="Tasks remaining"
          value={remaining}
          icon={Circle}
          color="bg-violet-500/15 text-violet-600 dark:text-violet-400"
        />
        <StatCard
          label="Focus minutes today"
          value={focusMinutes}
          icon={Timer}
          color="bg-blue-500/15 text-blue-600 dark:text-blue-400"
        />
        <StatCard
          label="Goals reached"
          value={goalsReached}
          icon={Target}
          color="bg-amber-500/15 text-amber-600 dark:text-amber-400"
        />
      </div>

      {/* Bottom row: top tasks, today's events, weather */}
      <div className="grid gap-6 lg:grid-cols-3">
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
                      <span className="shrink-0 font-mono text-xs text-muted-foreground">
                        {event.time}
                        {event.endTime ? `–${event.endTime}` : ""}
                      </span>
                    )}
                    <span className="truncate">{event.title}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Goals summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-base">
              <span>Goals</span>
              <span className="text-sm font-normal text-muted-foreground">
                {goalsReached} of {goals.length}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {goals.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No goals yet.{" "}
                <Link href="/goals" className="text-primary underline">
                  Set a goal
                </Link>
                .
              </p>
            ) : (
              <ul className="space-y-2">
                {goals.slice(0, 5).map((goal) => (
                  <li key={goal.id} className="flex items-center gap-2 text-sm">
                    {goal.done ? (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                    ) : (
                      <Circle className="h-4 w-4 shrink-0 text-muted-foreground" />
                    )}
                    <span
                      className={cn(
                        "truncate",
                        goal.done && "text-muted-foreground line-through",
                      )}
                    >
                      {goal.text}
                    </span>
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
