// The Daily Goals feature: set goals, mark them reached, delete them.
// Saved in the browser via useLocalStorage.
"use client";

import { useState } from "react";
import { Trash2, Plus, Trophy } from "lucide-react";
import { type Goal, STORAGE_KEYS, newId } from "@/lib/app-data";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function DailyGoals() {
  const { value: goals, setValue: setGoals } = useLocalStorage<Goal[]>(
    STORAGE_KEYS.goals,
    [],
  );
  const [text, setText] = useState("");

  function addGoal() {
    const trimmed = text.trim();
    if (!trimmed) return;
    const goal: Goal = {
      id: newId(),
      text: trimmed,
      done: false,
      createdAt: new Date().toISOString(),
    };
    setGoals([...goals, goal]);
    setText("");
  }

  function toggleGoal(id: string) {
    setGoals(goals.map((g) => (g.id === id ? { ...g, done: !g.done } : g)));
  }

  function deleteGoal(id: string) {
    setGoals(goals.filter((g) => g.id !== id));
  }

  const doneCount = goals.filter((g) => g.done).length;
  // Progress as a percentage (0 when there are no goals).
  const percent = goals.length === 0 ? 0 : Math.round((doneCount / goals.length) * 100);
  const allDone = goals.length > 0 && doneCount === goals.length;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Add-goal card */}
      <Card>
        <CardHeader>
          <CardTitle>Set a goal for today</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Input
              placeholder="e.g. Drink 2L of water"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") addGoal();
              }}
            />
            <Button onClick={addGoal}>
              <Plus className="h-4 w-4" />
              Add
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Goals list + progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Today&apos;s goals</span>
            <span className="text-sm font-normal text-muted-foreground">
              {doneCount} of {goals.length} reached
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Simple progress bar (a filled div inside a track div). */}
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${percent}%` }}
            />
          </div>

          {/* Celebration when every goal is reached. */}
          {allDone && (
            <div className="flex items-center gap-2 rounded-lg bg-primary/10 p-3 text-sm font-medium text-primary">
              <Trophy className="h-5 w-5" />
              Amazing! You reached all your goals today.
            </div>
          )}

          {goals.length === 0 ? (
            <p className="py-6 text-center text-muted-foreground">
              No goals yet. What do you want to achieve today?
            </p>
          ) : (
            <ul className="space-y-2">
              {goals.map((goal) => (
                <li
                  key={goal.id}
                  className="flex items-center gap-3 rounded-lg border p-3"
                >
                  <Checkbox
                    checked={goal.done}
                    onCheckedChange={() => toggleGoal(goal.id)}
                    aria-label="Toggle goal"
                  />
                  <span
                    className={
                      "flex-1 " +
                      (goal.done ? "text-muted-foreground line-through" : "")
                    }
                  >
                    {goal.text}
                  </span>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => deleteGoal(goal.id)}
                    aria-label="Delete goal"
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
