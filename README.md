# Daily Planner Dashboard

A clean, modern daily planner with an AI assistant. Plan your day, stay
focused, and track your progress — all in one place. **100% free to run** and
**open source (MIT)** — anyone can use it, run their own copy, or improve it.

## Features

- ✅ **To-Do List** — add, edit, complete, and delete tasks (with priorities)
- 📅 **Calendar** — manage events on a month grid
- 🎯 **Daily Goals** — set goals and track progress
- 📝 **Notes** — quick notes and ideas
- ⏱️ **Pomodoro Timer** — focus sessions with breaks (records focus time)
- 📊 **Dashboard** — completed/remaining tasks, focus minutes, goals, today's events
- 📈 **Weekly Progress** — simple charts for the last 7 days
- 🌤️ **Weather Widget** — today's weather (free, no API key)
- 🌗 **Light & Dark mode**
- 🤖 **AI Assistant** — plans your day, breaks tasks into steps, suggests
  priorities, gives tips, and celebrates when you finish everything

## Tech stack

Next.js 16 · React 19 · TypeScript · Tailwind CSS v4 · Shadcn UI · Recharts

## Where your data lives

All your tasks, goals, notes, events, and focus time are saved in **your
browser** (localStorage). There is no database and nothing is uploaded, so
it's private and free. (Data is per-browser: it won't sync across devices.)

## Run it locally

```bash
npm install
npm run dev
```

Then open **http://localhost:3001**.

## Turn on the AI assistant (free, optional)

The assistant uses Google Gemini's free tier.

1. Get a free API key: https://aistudio.google.com/apikey
2. Open the file `.env.local` and put your key after `GEMINI_API_KEY=`
3. Stop the app (Ctrl+C) and run `npm run dev` again

Without a key, everything else works and the assistant shows setup tips.

> **Note on the free tier:** Google's free Gemini tier allows a limited number
> of requests per minute. If you send many messages very quickly, the
> assistant may briefly say it's busy — just wait ~30 seconds and try again.
> If you deploy one public copy for many people, they all share that limit, so
> for heavy shared use it's best if each person runs their own copy with their
> own free key.

## Deploy for free (Vercel)

1. Push this project to GitHub.
2. Import it at https://vercel.com (free "Hobby" plan).
3. In the Vercel project settings, add an Environment Variable
   `GEMINI_API_KEY` with your key (optional, for the AI).
4. Deploy. Vercel gives you a free public URL.

## Project structure (quick tour)

```
src/
  app/                 Pages (each folder = a page) + the AI API route
    api/assistant/     Server route that talks to Gemini
  components/          UI split by feature (todo, goals, notes, ...)
    ui/                Shadcn base components (button, card, ...)
  hooks/
    use-local-storage.ts   Saves/loads state in the browser
  lib/
    app-data.ts        Shared types, storage keys, small helpers
    navigation.ts      The sidebar links
```

## Contributing

Contributions are welcome! Fork the repo, make your changes, and open a pull
request. This is a beginner-friendly project — the code is heavily commented.

## License

Released under the [MIT License](LICENSE) — free to use, modify, and share.
