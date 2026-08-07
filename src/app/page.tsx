// The Dashboard is the home page ("/"). It shows a summary of your day.
import { PageHeader } from "@/components/page-header";
import { Dashboard } from "@/components/dashboard/dashboard";

export default function DashboardPage() {
  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Your day at a glance — tasks, focus time, and progress."
      />
      <Dashboard />
    </div>
  );
}
