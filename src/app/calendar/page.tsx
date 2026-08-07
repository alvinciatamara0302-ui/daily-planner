// The Calendar page ("/calendar"). Shows the month calendar + events.
import { PageHeader } from "@/components/page-header";
import { CalendarView } from "@/components/calendar/calendar-view";

export default function CalendarPage() {
  return (
    <div>
      <PageHeader
        title="Calendar"
        description="Manage your daily events and schedule."
      />
      <CalendarView />
    </div>
  );
}
