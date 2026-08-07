// The Notes feature: jot down quick notes, edit and delete them.
// Saved in the browser via useLocalStorage.
"use client";

import { useState } from "react";
import { Trash2, Plus, Pencil, Check } from "lucide-react";
import { type Note, STORAGE_KEYS, newId } from "@/lib/app-data";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function NotesBoard() {
  const { value: notes, setValue: setNotes } = useLocalStorage<Note[]>(
    STORAGE_KEYS.notes,
    [],
  );

  // Text for the "new note" box.
  const [draft, setDraft] = useState("");

  // Which note is being edited, and its edited text.
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  function addNote() {
    const trimmed = draft.trim();
    if (!trimmed) return;
    const note: Note = {
      id: newId(),
      text: trimmed,
      updatedAt: new Date().toISOString(),
    };
    setNotes([note, ...notes]);
    setDraft("");
  }

  function deleteNote(id: string) {
    setNotes(notes.filter((n) => n.id !== id));
  }

  function startEdit(note: Note) {
    setEditingId(note.id);
    setEditText(note.text);
  }

  function saveEdit() {
    const trimmed = editText.trim();
    if (trimmed) {
      setNotes(
        notes.map((n) =>
          n.id === editingId
            ? { ...n, text: trimmed, updatedAt: new Date().toISOString() }
            : n,
        ),
      );
    }
    setEditingId(null);
    setEditText("");
  }

  return (
    <div className="space-y-6">
      {/* New-note box */}
      <Card className="mx-auto max-w-2xl">
        <CardHeader>
          <CardTitle>New note</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            placeholder="Write a quick note or idea..."
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={3}
          />
          <Button onClick={addNote}>
            <Plus className="h-4 w-4" />
            Add note
          </Button>
        </CardContent>
      </Card>

      {/* Notes grid */}
      {notes.length === 0 ? (
        <p className="py-6 text-center text-muted-foreground">
          No notes yet. Your notes will appear here.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {notes.map((note) => (
            <Card key={note.id} className="flex flex-col">
              <CardContent className="flex-1 pt-6">
                {editingId === note.id ? (
                  <Textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    rows={4}
                    autoFocus
                  />
                ) : (
                  // whitespace-pre-wrap keeps line breaks the user typed.
                  <p className="whitespace-pre-wrap text-sm">{note.text}</p>
                )}
              </CardContent>
              <CardFooter className="justify-end gap-1">
                {editingId === note.id ? (
                  <Button size="icon" variant="ghost" onClick={saveEdit} aria-label="Save note">
                    <Check className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => startEdit(note)}
                    aria-label="Edit note"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => deleteNote(note.id)}
                  aria-label="Delete note"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
