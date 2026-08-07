// The Pomodoro page ("/pomodoro"). Shows the focus timer.
import { PageHeader } from "@/components/page-header";
import { PomodoroTimer } from "@/components/pomodoro/pomodoro-timer";

export default function PomodoroPage() {
  return (
    <div>
      <PageHeader
        title="Pomodoro Timer"
        description="Focus in short sessions with breaks in between."
      />
      <PomodoroTimer />
    </div>
  );
}
