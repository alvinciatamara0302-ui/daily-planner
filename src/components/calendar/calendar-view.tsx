// The Calendar feature: a month grid + a panel to manage each day's events.
"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Trash2, Plus } from "lucide-react";
import {
  type CalendarEvent,
  STORAGE_KEYS,
  newId,
  toDateKey,
  todayKey,
} from "@/lib/app-data";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function CalendarView() {
  const { value: events, setValue: setEvents } = useLocalStorage<
    CalendarEvent[]
  >(STORAGE_KEYS.events, []);

  // Which month we're looking at, and which day is selected.
  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth()); // 0-11
  const [selectedDate, setSelectedDate] = useState<string>(todayKey());

  // Form state for adding an event to the selected day.
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("");

  // ---------- Build the grid ----------
  // Weekday of the 1st (0 = Sunday) tells us how many blanks to add first.
  const startWeekday = new Date(viewYear, viewMonth, 1).getDay();
  // Day 0 of next month = last day of this month = number of days.
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  // Cells: leading blanks (null) then day numbers 1..daysInMonth.
  const cells: (number | null)[] = [
    ...Array(startWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const monthName = new Date(viewYear, viewMonth, 1).toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  // ---------- Month navigation ----------
  function prevMonth() {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  }
  function nextMonth() {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  }

  // ---------- Event actions ----------
  function addEvent() {
    const trimmed = title.trim();
    if (!trimmed) return;
    const event: CalendarEvent = {
      id: newId(),
      title: trimmed,
      date: selectedDate,
      time: time || undefined,
    };
    setEvents([...events, event]);
    setTitle("");
    setTime("");
  }

  function deleteEvent(id: string) {
    setEvents(events.filter((e) => e.id !== id));
  }

  // How many events a given date has (for the little dot on each cell).
  function countFor(dateKey: string) {
    return events.filter((e) => e.date === dateKey).length;
  }

  // Events for the selected day, sorted by time (untimed ones last).
  const selectedEvents = events
    .filter((e) => e.date === selectedDate)
    .sort((a, b) => (a.time || "99:99").localeCompare(b.time || "99:99"));

  const today = todayKey();

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      {/* ---------- Month grid ---------- */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>{monthName}</CardTitle>
          <div className="flex gap-1">
            <Button size="icon" variant="outline" onClick={prevMonth} aria-label="Previous month">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="outline" onClick={nextMonth} aria-label="Next month">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Weekday header row */}
          <div className="mb-2 grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted-foreground">
            {WEEKDAYS.map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>
          {/* Day cells */}
          <div className="grid grid-cols-7 gap-1">
            {cells.map((day, index) => {
              if (day === null) {
                // Empty cell before the 1st of the month.
                return <div key={`blank-${index}`} />;
              }
              const dateKey = toDateKey(new Date(viewYear, viewMonth, day));
              const isSelected = dateKey === selectedDate;
              const isToday = dateKey === today;
              const count = countFor(dateKey);

              return (
                <button
                  key={dateKey}
                  onClick={() => setSelectedDate(dateKey)}
                  className={cn(
                    "flex aspect-square flex-col items-center justify-center rounded-md border text-sm transition-colors hover:bg-accent",
                    isSelected && "border-primary bg-primary text-primary-foreground hover:bg-primary",
                    !isSelected && isToday && "border-primary",
                  )}
                >
                  <span>{day}</span>
                  {/* A small dot if this day has any events. */}
                  {count > 0 && (
                    <span
                      className={cn(
                        "mt-0.5 h-1.5 w-1.5 rounded-full",
                        isSelected ? "bg-primary-foreground" : "bg-primary",
                      )}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* ---------- Selected day panel ---------- */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {new Date(selectedDate + "T00:00:00").toLocaleDateString("default", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add-event form */}
          <div className="space-y-2">
            <Input
              placeholder="Event title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") addEvent();
              }}
            />
            <div className="flex gap-2">
              <Input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="flex-1"
                aria-label="Event time"
              />
              <Button onClick={addEvent}>
                <Plus className="h-4 w-4" />
                Add
              </Button>
            </div>
          </div>

          {/* Event list for this day */}
          {selectedEvents.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">
              No events on this day.
            </p>
          ) : (
            <ul className="space-y-2">
              {selectedEvents.map((event) => (
                <li
                  key={event.id}
                  className="flex items-center gap-2 rounded-lg border p-2 text-sm"
                >
                  {event.time && (
                    <span className="font-mono text-xs text-muted-foreground">
                      {event.time}
                    </span>
                  )}
                  <span className="flex-1">{event.title}</span>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => deleteEvent(event.id)}
                    aria-label="Delete event"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
