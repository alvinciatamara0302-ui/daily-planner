// Server-side route for the AI assistant.
// This runs on the SERVER, so the Gemini API key stays secret
// (it is never sent to the browser).
//
// It receives the user's message plus their current tasks and goals,
// asks Google Gemini (free tier), and returns a text reply.

// The shape of the data the browser sends us.
type Task = { title: string; completed: boolean; priority: string };
type Goal = { text: string; done: boolean };

export async function POST(request: Request) {
  const { message, tasks = [], goals = [] } = (await request.json()) as {
    message: string;
    tasks?: Task[];
    goals?: Goal[];
  };

  const apiKey = process.env.GEMINI_API_KEY;

  // If there's no key yet, explain how to add one (the app still works
  // without AI — this keeps everything free and optional).
  if (!apiKey) {
    return Response.json({
      reply:
        "The AI assistant isn't connected yet. To turn it on for free: get a Gemini API key from https://aistudio.google.com/apikey, then add a line GEMINI_API_KEY=your_key to a file named .env.local in the project and restart the app.",
    });
  }

  // Instructions that tell Gemini how to behave.
  const systemInstruction =
    "You are a friendly, encouraging productivity assistant inside a Daily Planner app. " +
    "Help the user plan their day, break big tasks into small clear steps, suggest which tasks to do first, " +
    "and give short practical productivity tips. If all their tasks are completed, congratulate them warmly. " +
    "Keep answers concise, positive, and easy to understand. Use short paragraphs or bullet points.";

  // Summarize the user's current data so the AI has context.
  const remaining = tasks.filter((t) => !t.completed);
  const taskLines =
    tasks.length === 0
      ? "(no tasks yet)"
      : tasks
          .map(
            (t) =>
              `- ${t.title} [${t.priority} priority] ${t.completed ? "(done)" : "(not done)"}`,
          )
          .join("\n");
  const goalLines =
    goals.length === 0
      ? "(no goals yet)"
      : goals
          .map((g) => `- ${g.text} ${g.done ? "(reached)" : "(not reached)"}`)
          .join("\n");

  const context =
    `Here is the user's current data.\n\n` +
    `Tasks:\n${taskLines}\n\n` +
    `Goals:\n${goalLines}\n\n` +
    `Number of tasks still to do: ${remaining.length}.\n\n` +
    `The user says: "${message}"`;

  // Which Gemini model to use (a free, fast one). Can be overridden by env.
  // "gemini-flash-latest" always points at the current free flash model.
  const model = process.env.GEMINI_MODEL || "gemini-flash-latest";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemInstruction }] },
        contents: [{ role: "user", parts: [{ text: context }] }],
      }),
    });

    const data = await res.json();

    // If Gemini returned an error, surface a friendly message.
    if (!res.ok) {
      const detail = data?.error?.message || "Unknown error";
      return Response.json({
        reply: `Sorry, the AI service returned an error: ${detail}`,
      });
    }

    // Pull the text out of Gemini's response shape.
    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ??
      "Sorry, I couldn't come up with a response. Please try again.";

    return Response.json({ reply });
  } catch {
    return Response.json({
      reply:
        "Sorry, I couldn't reach the AI service. Please check your internet connection and try again.",
    });
  }
}
