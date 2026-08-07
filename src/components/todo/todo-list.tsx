// The To-Do List feature: add, edit, complete, and delete tasks.
// Tasks are saved in the browser via our useLocalStorage hook.
"use client";

import { useState } from "react";
import { Pencil, Trash2, Check, X, Plus } from "lucide-react";
import { toast } from "sonner";
import {
  type Task,
  type Priority,
  STORAGE_KEYS,
  newId,
} from "@/lib/app-data";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// How each priority looks as a colored badge.
const priorityBadge: Record<Priority, { label: string; variant: "destructive" | "default" | "secondary" }> = {
  high: { label: "High", variant: "destructive" },
  medium: { label: "Medium", variant: "default" },
  low: { label: "Low", variant: "secondary" },
};

// Used to sort tasks so higher priority shows first.
const priorityRank: Record<Priority, number> = { high: 0, medium: 1, low: 2 };

export function TodoList() {
  // The saved list of tasks (persists in localStorage).
  const { value: tasks, setValue: setTasks } = useLocalStorage<Task[]>(
    STORAGE_KEYS.tasks,
    [],
  );

  // Form state for adding a new task.
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");

  // State for editing an existing task (which one, and the edited text).
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  // ---------- Actions ----------

  function addTask() {
    const trimmed = title.trim();
    if (!trimmed) return; // ignore empty input

    const task: Task = {
      id: newId(),
      title: trimmed,
      completed: false,
      priority,
      createdAt: new Date().toISOString(),
    };
    setTasks([task, ...tasks]); // add to the top
    setTitle(""); // clear the input
    setPriority("medium"); // reset priority
    toast.success("Task added");
  }

  function toggleTask(id: string) {
    setTasks(
      tasks.map((t) =>
        t.id === id
          ? {
              ...t,
              completed: !t.completed,
              // Record when it was completed (for the dashboard/charts).
              completedAt: !t.completed ? new Date().toISOString() : undefined,
            }
          : t,
      ),
    );
  }

  function deleteTask(id: string) {
    setTasks(tasks.filter((t) => t.id !== id));
    toast("Task deleted");
  }

  function startEdit(task: Task) {
    setEditingId(task.id);
    setEditText(task.title);
  }

  function saveEdit() {
    const trimmed = editText.trim();
    if (trimmed) {
      setTasks(
        tasks.map((t) => (t.id === editingId ? { ...t, title: trimmed } : t)),
      );
    }
    setEditingId(null);
    setEditText("");
  }

  // ---------- Derived values ----------

  const completedCount = tasks.filter((t) => t.completed).length;

  // Sort: unfinished first, then by priority, then newest first.
  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    if (a.priority !== b.priority)
      return priorityRank[a.priority] - priorityRank[b.priority];
    return b.createdAt.localeCompare(a.createdAt);
  });

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* ---------- Add-task card ---------- */}
      <Card>
        <CardHeader>
          <CardTitle>Add a task</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Input
              placeholder="What do you need to do?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              // Pressing Enter adds the task.
              onKeyDown={(e) => {
                if (e.key === "Enter") addTask();
              }}
            />
            {/* Native dropdown for priority (simple and reliable). */}
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
              className="h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-sm"
              aria-label="Priority"
            >
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <Button onClick={addTask}>
              <Plus className="h-4 w-4" />
              Add
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ---------- Task list card ---------- */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Your tasks</span>
            <span className="text-sm font-normal text-muted-foreground">
              {completedCount} of {tasks.length} done
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {tasks.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">
              No tasks yet. Add your first task above!
            </p>
          ) : (
            <ul className="space-y-2">
              {sortedTasks.map((task) => (
                <li
                  key={task.id}
                  className="flex items-center gap-3 rounded-lg border p-3"
                >
                  {/* Complete/uncomplete checkbox */}
                  <Checkbox
                    checked={task.completed}
                    onCheckedChange={() => toggleTask(task.id)}
                    aria-label="Toggle complete"
                  />

                  {editingId === task.id ? (
                    // ----- Edit mode: show an input + save/cancel -----
                    <>
                      <Input
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveEdit();
                          if (e.key === "Escape") setEditingId(null);
                        }}
                        autoFocus
                        className="flex-1"
                      />
                      <Button size="icon" variant="ghost" onClick={saveEdit} aria-label="Save">
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setEditingId(null)}
                        aria-label="Cancel"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    // ----- Normal mode: show title, priority, actions -----
                    <>
                      <span
                        className={
                          "flex-1 " +
                          (task.completed
                            ? "text-muted-foreground line-through"
                            : "")
                        }
                      >
                        {task.title}
                      </span>
                      <Badge variant={priorityBadge[task.priority].variant}>
                        {priorityBadge[task.priority].label}
                      </Badge>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => startEdit(task)}
                        aria-label="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => deleteTask(task.id)}
                        aria-label="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
