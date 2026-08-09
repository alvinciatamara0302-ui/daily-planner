// The Dashboard is the home page ("/"). It shows a summary of your day.
// The weather widget sits beside the page title.
import { Dashboard } from "@/components/dashboard/dashboard";
import { WeatherWidget } from "@/components/weather/weather-widget";

export default function DashboardPage() {
  return (
    <div>
      {/* Title on the left, weather on the right (stacks on mobile). */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            Dashboard
          </h1>
          <p className="mt-1 text-muted-foreground">
            Your day at a glance — tasks, focus time, and progress.
          </p>
        </div>
        {/* Fixed-ish width so it looks tidy next to the title. */}
        <div className="w-full md:w-80 md:shrink-0">
          <WeatherWidget />
        </div>
      </div>

      <Dashboard />
    </div>
  );
}
