// Server-side route for the AI assistant.
// Runs on the SERVER, so the Gemini API key stays secret.
//
// The assistant can now DO things, not just talk. It replies with JSON:
//   { "reply": "...text...", "actions": [ ...changes to make... ] }
// The browser then applies those actions to the user's tasks/events.

type Task = {
  id: string;
  title: string;
  completed: boolean;
  priority: string;
};
type Goal = { id: string; text: string; done: boolean };
type CalendarEvent = {
  id: string;
  title: string;
  date: string;
  time?: string;
  endTime?: string;
};

export async function POST(request: Request) {
  const {
    message,
    tasks = [],
    goals = [],
    events = [],
    today = "",
  } = (await request.json()) as {
    message: string;
    tasks?: Task[];
    goals?: Goal[];
    events?: CalendarEvent[];
    today?: string;
  };

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return Response.json({
      reply:
        "The AI assistant isn't connected yet. Add a free GEMINI_API_KEY (from https://aistudio.google.com/apikey) to your environment to turn it on.",
      actions: [],
    });
  }

  // Tell Gemini how to behave AND exactly what JSON shape to return.
  const systemInstruction = `You are a friendly, encouraging productivity assistant inside a Daily Planner app. You can schedule and rearrange the user's day.

Today's date is ${today}.

You MUST respond with ONLY a JSON object of this shape:
{
  "reply": string,          // a short, friendly message to show the user
  "actions": Action[]       // changes to apply to their planner (may be empty)
}

An Action is one of:
- { "type": "add_event", "title": string, "date": "YYYY-MM-DD", "time": "HH:MM", "endTime": "HH:MM" }
- { "type": "update_event", "id": string, "title"?: string, "date"?: "YYYY-MM-DD", "time"?: "HH:MM", "endTime"?: "HH:MM" }
- { "type": "delete_event", "id": string }
- { "type": "add_task", "title": string, "priority": "low" | "medium" | "high" }
- { "type": "add_goal", "text": string }

Rules:
- Use 24-hour times (e.g. "14:00"). If no date is given, use today's date.
- Only include actions when the user clearly wants to add, schedule, move, rearrange, or remove something. For questions, advice, or suggestions, return an empty "actions" array and put your help in "reply".
- To move or rearrange EXISTING events, use "update_event" with the exact "id" from the events list below. Never invent ids.
- When you make changes, briefly say what you did in "reply".
- Keep "reply" concise, positive, and easy to read.`;

  // Give the AI the user's current data (with ids so it can edit them).
  const eventsText =
    events.length === 0
      ? "(none)"
      : events
          .map(
            (e) =>
              `- id=${e.id} | "${e.title}" | ${e.date} ${e.time ?? ""}${e.endTime ? "-" + e.endTime : ""}`,
          )
          .join("\n");
  const tasksText =
    tasks.length === 0
      ? "(none)"
      : tasks
          .map(
            (t) =>
              `- id=${t.id} | "${t.title}" | ${t.priority} | ${t.completed ? "done" : "not done"}`,
          )
          .join("\n");
  const goalsText =
    goals.length === 0
      ? "(none)"
      : goals.map((g) => `- "${g.text}" | ${g.done ? "reached" : "not reached"}`).join("\n");

  const context = `Current events:\n${eventsText}\n\nCurrent tasks:\n${tasksText}\n\nCurrent goals:\n${goalsText}\n\nThe user says: "${message}"`;

  const model = process.env.GEMINI_MODEL || "gemini-flash-latest";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemInstruction }] },
        contents: [{ role: "user", parts: [{ text: context }] }],
        // Ask Gemini to reply with pure JSON.
        generationConfig: { responseMimeType: "application/json", temperature: 0.7 },
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      const detail = data?.error?.message || "Unknown error";
      return Response.json({
        reply: `Sorry, the AI service returned an error: ${detail}`,
        actions: [],
      });
    }

    const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";

    // Parse the JSON the AI returned. If anything is off, fall back to
    // showing the raw text as a reply with no actions.
    try {
      const parsed = JSON.parse(raw);
      return Response.json({
        reply: typeof parsed.reply === "string" ? parsed.reply : "Done!",
        actions: Array.isArray(parsed.actions) ? parsed.actions : [],
      });
    } catch {
      return Response.json({ reply: raw, actions: [] });
    }
  } catch {
    return Response.json({
      reply:
        "Sorry, I couldn't reach the AI service. Please check your connection and try again.",
      actions: [],
    });
  }
}
