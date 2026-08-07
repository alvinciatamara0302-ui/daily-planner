// The To-Do page ("/todo"). It shows the interactive TodoList feature.
import { PageHeader } from "@/components/page-header";
import { TodoList } from "@/components/todo/todo-list";

export default function TodoPage() {
  return (
    <div>
      <PageHeader
        title="To-Do List"
        description="Add, edit, complete, and delete your tasks."
      />
      <TodoList />
    </div>
  );
}
