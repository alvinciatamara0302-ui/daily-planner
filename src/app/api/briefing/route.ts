// Server-side route for the "Today's AI Briefing" card.
// It writes a short, plain-language summary of the user's day.

type Task = { title: string; completed: boolean; priority: string };
type Goal = { text: string; done: boolean };
type CalendarEvent = { title: string; time?: string; endTime?: string };

export async function POST(request: Request) {
  const {
    name = "",
    tasks = [],
    goals = [],
    events = [],
    weather = "",
  } = (await request.json()) as {
    name?: string;
    tasks?: Task[];
    goals?: Goal[];
    events?: CalendarEvent[];
    weather?: string;
  };

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    // A simple non-AI fallback so the card still shows something useful.
    const remaining = tasks.filter((t) => !t.completed).length;
    const hello = name ? `Good day, ${name}!` : "Good day!";
    return Response.json({
      briefing: `${hello} You have ${remaining} task(s) to do and ${events.length} event(s) scheduled today. Add a free Gemini API key to get a smart AI briefing here.`,
    });
  }

  const systemInstruction =
    "You write a short, warm 'morning briefing' for a daily planner app. " +
    "Write 2-4 sentences in a friendly, motivating tone. Greet the user by name if given. " +
    "Mention how many tasks and events they have, call out the highest-priority task, " +
    "weave in the weather naturally if provided, and end with one encouraging suggestion. " +
    "Keep it plain and easy to read. Do not use markdown or bullet points.";

  const remaining = tasks.filter((t) => !t.completed);
  const topTask =
    remaining.find((t) => t.priority === "high") ||
    remaining.find((t) => t.priority === "medium") ||
    remaining[0];

  const eventsText =
    events.length === 0
      ? "no events"
      : events
          .map((e) => `${e.title}${e.time ? " at " + e.time : ""}`)
          .join(", ");

  const context =
    `User's name: ${name || "(unknown)"}\n` +
    `Number of tasks to do: ${remaining.length}\n` +
    `Highest priority task: ${topTask ? topTask.title : "none"}\n` +
    `Events today: ${eventsText}\n` +
    `Goals: ${goals.map((g) => g.text).join(", ") || "none"}\n` +
    `Weather today: ${weather || "unknown"}\n\n` +
    `Write the morning briefing now.`;

  const model = process.env.GEMINI_MODEL || "gemini-flash-latest";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemInstruction }] },
        contents: [{ role: "user", parts: [{ text: context }] }],
        generationConfig: { temperature: 0.8 },
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      return Response.json({
        briefing: `Good day${name ? ", " + name : ""}! You have ${remaining.length} task(s) and ${events.length} event(s) today.`,
      });
    }
    const briefing =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ??
      `Good day${name ? ", " + name : ""}! Have a productive day.`;
    return Response.json({ briefing });
  } catch {
    return Response.json({
      briefing: `Good day${name ? ", " + name : ""}! You have ${remaining.length} task(s) and ${events.length} event(s) today.`,
    });
  }
}
