// The AI Assistant: a floating chat widget available on every page.
// It sends the user's message + their tasks/goals/events to the server
// route, then APPLIES the actions the AI returns (add/move/delete events,
// add tasks/goals). Because everything is saved in localStorage, the
// dashboard and calendar update automatically.
"use client";

import { useEffect, useRef, useState } from "react";
import { Sparkles, Send, X, Bot, User } from "lucide-react";
import { toast } from "sonner";
import {
  type Task,
  type Goal,
  type CalendarEvent,
  type Priority,
  STORAGE_KEYS,
  newId,
  todayKey,
} from "@/lib/app-data";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Message = { role: "user" | "assistant"; text: string };

// One instruction the AI can send back for us to apply.
type Action = {
  type: string;
  id?: string;
  title?: string;
  text?: string;
  date?: string;
  time?: string;
  endTime?: string;
  priority?: Priority;
};

const WELCOME: Message = {
  role: "assistant",
  text: "Hi! I'm your planning assistant. Tell me your plans (e.g. \"Padel 2-4pm, learn Chinese 5-6pm\") and I'll add them for you. Ask me to rearrange your day, break down a task, or suggest what to do first.",
};

const QUICK_ACTIONS = [
  "Plan my day",
  "What should I do first?",
  "Rearrange my schedule",
];

export function AiAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // Live copies of the user's data (read + write, synced to localStorage).
  const tasks = useLocalStorage<Task[]>(STORAGE_KEYS.tasks, []);
  const goals = useLocalStorage<Goal[]>(STORAGE_KEYS.goals, []);
  const events = useLocalStorage<CalendarEvent[]>(STORAGE_KEYS.events, []);

  // Auto-scroll to newest message.
  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Apply the AI's actions to the user's data. Returns how many were applied.
  function applyActions(actions: Action[]): number {
    let count = 0;
    for (const a of actions) {
      if (a.type === "add_event" && a.title) {
        events.setValue((prev) => [
          ...prev,
          {
            id: newId(),
            title: a.title!,
            date: a.date || todayKey(),
            time: a.time,
            endTime: a.endTime,
          },
        ]);
        count++;
      } else if (a.type === "update_event" && a.id) {
        events.setValue((prev) =>
          prev.map((e) =>
            e.id === a.id
              ? {
                  ...e,
                  ...(a.title !== undefined ? { title: a.title } : {}),
                  ...(a.date !== undefined ? { date: a.date } : {}),
                  ...(a.time !== undefined ? { time: a.time } : {}),
                  ...(a.endTime !== undefined ? { endTime: a.endTime } : {}),
                }
              : e,
          ),
        );
        count++;
      } else if (a.type === "delete_event" && a.id) {
        events.setValue((prev) => prev.filter((e) => e.id !== a.id));
        count++;
      } else if (a.type === "add_task" && a.title) {
        tasks.setValue((prev) => [
          {
            id: newId(),
            title: a.title!,
            completed: false,
            priority: a.priority || "medium",
            createdAt: new Date().toISOString(),
          },
          ...prev,
        ]);
        count++;
      } else if (a.type === "add_goal" && a.text) {
        goals.setValue((prev) => [
          ...prev,
          {
            id: newId(),
            text: a.text!,
            done: false,
            createdAt: new Date().toISOString(),
          },
        ]);
        count++;
      }
    }
    return count;
  }

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    setMessages((prev) => [...prev, { role: "user", text: trimmed }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          tasks: tasks.value,
          goals: goals.value,
          events: events.value,
          today: todayKey(),
        }),
      });
      const data = await res.json();

      // Apply any changes the AI asked for.
      const applied = applyActions(
        Array.isArray(data.actions) ? data.actions : [],
      );
      if (applied > 0) {
        toast.success(
          `Updated your planner (${applied} change${applied > 1 ? "s" : ""}).`,
        );
      }

      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: data.reply ?? "Done!" },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "Sorry, something went wrong. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Floating open button with a gradient + glow */}
      {!open && (
        <Button
          onClick={() => setOpen(true)}
          size="icon"
          className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-gradient-to-br from-violet-600 to-blue-500 text-white shadow-lg shadow-violet-500/40 hover:from-violet-500 hover:to-blue-400"
          aria-label="Open AI assistant"
        >
          <Sparkles className="h-6 w-6" />
        </Button>
      )}

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-6 right-6 z-50 flex h-[32rem] max-h-[calc(100vh-3rem)] w-[calc(100vw-3rem)] max-w-sm flex-col overflow-hidden rounded-2xl border bg-card/95 shadow-xl ring-1 ring-violet-500/20 backdrop-blur-md">
          {/* Header with gradient accent */}
          <div className="flex items-center justify-between bg-gradient-to-r from-violet-600 to-blue-500 px-4 py-3 text-white">
            <div className="flex items-center gap-2 font-semibold">
              <Sparkles className="h-5 w-5" />
              AI Assistant
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close assistant"
              className="rounded-md p-1 hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 space-y-4 overflow-y-auto p-4">
            {messages.map((m, i) => (
              <div
                key={i}
                className={cn(
                  "flex gap-2 text-sm",
                  m.role === "user" && "flex-row-reverse",
                )}
              >
                <div
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                    m.role === "assistant"
                      ? "bg-gradient-to-br from-violet-500 to-blue-500 text-white"
                      : "bg-muted",
                  )}
                >
                  {m.role === "assistant" ? (
                    <Bot className="h-4 w-4" />
                  ) : (
                    <User className="h-4 w-4" />
                  )}
                </div>
                <div
                  className={cn(
                    "max-w-[80%] whitespace-pre-wrap rounded-lg px-3 py-2",
                    m.role === "assistant"
                      ? "bg-muted"
                      : "bg-primary text-primary-foreground",
                  )}
                >
                  {m.text}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-2 text-sm">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-blue-500 text-white">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="rounded-lg bg-muted px-3 py-2 text-muted-foreground">
                  Thinking…
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick actions (only at the start of a chat) */}
          {messages.length <= 1 && (
            <div className="flex flex-wrap gap-2 px-4 pb-2">
              {QUICK_ACTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => send(q)}
                  className="rounded-full border border-violet-500/30 px-3 py-1 text-xs text-violet-600 hover:bg-violet-500/10 dark:text-violet-300"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input row */}
          <div className="flex gap-2 border-t p-3">
            <Input
              placeholder="Tell me your plans..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") send(input);
              }}
              disabled={loading}
            />
            <Button
              size="icon"
              onClick={() => send(input)}
              disabled={loading}
              aria-label="Send message"
              className="bg-gradient-to-br from-violet-600 to-blue-500 text-white hover:from-violet-500 hover:to-blue-400"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
