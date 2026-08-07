// This file is the "shared contract" for all our data.
// Every feature (tasks, goals, notes, events, focus time) uses the
// types and keys defined here, so they all stay consistent.

// ---------- Data shapes (TypeScript "types") ----------
// A type just describes what fields an object has and their kinds.

export type Priority = "low" | "medium" | "high";

// A single to-do item.
export type Task = {
  id: string;
  title: string;
  completed: boolean;
  priority: Priority;
  createdAt: string; // ISO date-time string
  completedAt?: string; // set when the task is completed
};

// A daily goal.
export type Goal = {
  id: string;
  text: string;
  done: boolean;
  createdAt: string;
};

// A quick note.
export type Note = {
  id: string;
  text: string;
  updatedAt: string;
};

// A calendar event (a scheduled thing on a given day).
export type CalendarEvent = {
  id: string;
  title: string;
  date: string; // "YYYY-MM-DD"
  time?: string; // optional "HH:MM"
};

// One completed focus session from the Pomodoro timer.
export type FocusSession = {
  date: string; // "YYYY-MM-DD"
  minutes: number;
};

// ---------- localStorage keys ----------
// These strings are the "drawers" in the browser where each kind of
// data is saved. Prefixed with "dp." (daily planner) to avoid clashes.
export const STORAGE_KEYS = {
  tasks: "dp.tasks",
  goals: "dp.goals",
  notes: "dp.notes",
  events: "dp.events",
  focus: "dp.focusSessions",
} as const;

// ---------- Small helpers ----------

// Create a unique ID for a new item.
export function newId(): string {
  // Modern browsers/Node have this built in.
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  // Fallback just in case.
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// Turn a Date into a local "YYYY-MM-DD" string (no timezone surprises).
export function toDateKey(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Today's date as "YYYY-MM-DD".
export function todayKey(): string {
  return toDateKey(new Date());
}

// The last N days as "YYYY-MM-DD" strings, oldest first.
// Used by the dashboard and weekly charts.
export function lastNDays(n: number): string[] {
  const days: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(toDateKey(d));
  }
  return days;
}
