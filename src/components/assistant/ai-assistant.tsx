// The AI Assistant: a floating chat widget available on every page.
// It sends the user's message + their tasks/goals to our server route
// (/api/assistant), which asks Gemini and returns a reply.
"use client";

import { useEffect, useRef, useState } from "react";
import { Sparkles, Send, X, Bot, User } from "lucide-react";
import { STORAGE_KEYS } from "@/lib/app-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// One chat message.
type Message = { role: "user" | "assistant"; text: string };

// The assistant's opening message.
const WELCOME: Message = {
  role: "assistant",
  text: "Hi! I'm your planning assistant. I can help you plan your day, break big tasks into steps, decide what to do first, or share a quick tip. How can I help?",
};

// Buttons that send a ready-made question.
const QUICK_ACTIONS = [
  "Plan my day",
  "What should I do first?",
  "Give me a productivity tip",
];

export function AiAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // Used to auto-scroll to the newest message.
  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Send a message to the assistant.
  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    // Show the user's message immediately.
    setMessages((prev) => [...prev, { role: "user", text: trimmed }]);
    setInput("");
    setLoading(true);

    // Read the current tasks and goals from the browser to give the AI context.
    let tasks: unknown = [];
    let goals: unknown = [];
    try {
      tasks = JSON.parse(localStorage.getItem(STORAGE_KEYS.tasks) || "[]");
      goals = JSON.parse(localStorage.getItem(STORAGE_KEYS.goals) || "[]");
    } catch {
      // Ignore; send empty context.
    }

    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed, tasks, goals }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: data.reply ?? "Sorry, please try again." },
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
      {/* Floating open button (bottom-right). Hidden while the panel is open. */}
      {!open && (
        <Button
          onClick={() => setOpen(true)}
          size="icon"
          className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg"
          aria-label="Open AI assistant"
        >
          <Sparkles className="h-6 w-6" />
        </Button>
      )}

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-6 right-6 z-50 flex h-[32rem] max-h-[calc(100vh-3rem)] w-[calc(100vw-3rem)] max-w-sm flex-col overflow-hidden rounded-xl border bg-card shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div className="flex items-center gap-2 font-semibold">
              <Sparkles className="h-5 w-5 text-primary" />
              AI Assistant
            </div>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setOpen(false)}
              aria-label="Close assistant"
            >
              <X className="h-5 w-5" />
            </Button>
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
                      ? "bg-primary/10 text-primary"
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

            {/* "Thinking..." indicator while waiting for a reply */}
            {loading && (
              <div className="flex gap-2 text-sm">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="rounded-lg bg-muted px-3 py-2 text-muted-foreground">
                  Thinking…
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick actions (only shown at the start of a chat) */}
          {messages.length <= 1 && (
            <div className="flex flex-wrap gap-2 px-4 pb-2">
              {QUICK_ACTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => send(q)}
                  className="rounded-full border px-3 py-1 text-xs hover:bg-accent"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input row */}
          <div className="flex gap-2 border-t p-3">
            <Input
              placeholder="Ask me anything..."
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
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
