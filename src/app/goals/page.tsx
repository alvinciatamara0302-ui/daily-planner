// The Goals page ("/goals"). Shows the DailyGoals feature.
import { PageHeader } from "@/components/page-header";
import { DailyGoals } from "@/components/goals/daily-goals";

export default function GoalsPage() {
  return (
    <div>
      <PageHeader
        title="Daily Goals"
        description="Set the goals you want to reach today."
      />
      <DailyGoals />
    </div>
  );
}
