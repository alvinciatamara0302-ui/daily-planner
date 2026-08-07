// The Weekly Progress page ("/weekly"). Shows simple charts.
import { PageHeader } from "@/components/page-header";
import { WeeklyProgress } from "@/components/weekly/weekly-progress";

export default function WeeklyPage() {
  return (
    <div>
      <PageHeader
        title="Weekly Progress"
        description="See your progress over the week with simple charts."
      />
      <WeeklyProgress />
    </div>
  );
}
