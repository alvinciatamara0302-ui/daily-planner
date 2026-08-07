// The Notes page ("/notes"). Shows the NotesBoard feature.
import { PageHeader } from "@/components/page-header";
import { NotesBoard } from "@/components/notes/notes-board";

export default function NotesPage() {
  return (
    <div>
      <PageHeader
        title="Notes"
        description="Jot down quick notes and ideas."
      />
      <NotesBoard />
    </div>
  );
}
