// The Weekly Progress feature: two simple bar charts for the last 7 days
// (tasks completed per day, and focus minutes per day) using Recharts.
"use client";

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import {
  type Task,
  type FocusSession,
  STORAGE_KEYS,
  lastNDays,
  toDateKey,
} from "@/lib/app-data";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Style for the tooltip popup so it matches light/dark theme.
const tooltipStyle = {
  background: "var(--popover)",
  border: "1px solid var(--border)",
  borderRadius: "8px",
  color: "var(--popover-foreground)",
  fontSize: "12px",
};

export function WeeklyProgress() {
  const { value: tasks } = useLocalStorage<Task[]>(STORAGE_KEYS.tasks, []);
  const { value: focusSessions } = useLocalStorage<FocusSession[]>(
    STORAGE_KEYS.focus,
    [],
  );

  // The last 7 days as "YYYY-MM-DD" strings (oldest first).
  const days = lastNDays(7);

  // Build one data point per day for the charts.
  const data = days.map((day) => {
    // Short weekday label, e.g. "Mon".
    const label = new Date(day + "T00:00:00").toLocaleDateString("default", {
      weekday: "short",
    });

    // Tasks whose completion date matches this day.
    const completed = tasks.filter(
      (t) => t.completedAt && toDateKey(new Date(t.completedAt)) === day,
    ).length;

    // Focus minutes recorded on this day.
    const minutes = focusSessions
      .filter((s) => s.date === day)
      .reduce((sum, s) => sum + s.minutes, 0);

    return { label, completed, minutes };
  });

  // Totals shown above each chart.
  const totalCompleted = data.reduce((sum, d) => sum + d.completed, 0);
  const totalMinutes = data.reduce((sum, d) => sum + d.minutes, 0);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Chart 1: tasks completed per day */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Tasks completed{" "}
            <span className="font-normal text-muted-foreground">
              ({totalCompleted} this week)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 w-full text-muted-foreground">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="currentColor"
                  opacity={0.15}
                />
                <XAxis
                  dataKey="label"
                  tick={{ fill: "currentColor", fontSize: 12 }}
                  stroke="currentColor"
                  opacity={0.5}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fill: "currentColor", fontSize: 12 }}
                  stroke="currentColor"
                  opacity={0.5}
                />
                <Tooltip contentStyle={tooltipStyle} cursor={{ opacity: 0.1 }} />
                <Bar
                  dataKey="completed"
                  className="fill-primary"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Chart 2: focus minutes per day */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Focus minutes{" "}
            <span className="font-normal text-muted-foreground">
              ({totalMinutes} this week)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 w-full text-muted-foreground">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="currentColor"
                  opacity={0.15}
                />
                <XAxis
                  dataKey="label"
                  tick={{ fill: "currentColor", fontSize: 12 }}
                  stroke="currentColor"
                  opacity={0.5}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fill: "currentColor", fontSize: 12 }}
                  stroke="currentColor"
                  opacity={0.5}
                />
                <Tooltip contentStyle={tooltipStyle} cursor={{ opacity: 0.1 }} />
                <Bar
                  dataKey="minutes"
                  className="fill-primary"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
