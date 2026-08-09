// Small helper to fetch today's weather from the free Open-Meteo API.
// Used by the AI Briefing card. (The Weather widget has its own copy so
// it can also show icons.)

const FALLBACK = { lat: -6.2, lon: 106.8 }; // Jakarta, if location denied

export type CurrentWeather = { temp: number; code: number };

// Turn an Open-Meteo weather code into a short label.
export function describeWeatherCode(code: number): string {
  if (code === 0) return "clear and sunny";
  if (code === 1 || code === 2) return "partly cloudy";
  if (code === 3) return "overcast";
  if (code === 45 || code === 48) return "foggy";
  if (code >= 51 && code <= 57) return "drizzly";
  if (code >= 61 && code <= 67) return "rainy";
  if (code >= 71 && code <= 77) return "snowy";
  if (code >= 80 && code <= 82) return "rainy with showers";
  if (code === 85 || code === 86) return "snowy";
  if (code >= 95) return "stormy";
  return "cloudy";
}

async function fetchAt(lat: number, lon: number): Promise<CurrentWeather> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&timezone=auto`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("weather failed");
  const data = await res.json();
  return {
    temp: Math.round(data.current.temperature_2m),
    code: data.current.weather_code,
  };
}

// Get current weather (tries browser location, falls back to a default city).
// Resolves to null if it can't be fetched — the caller can just skip weather.
export function getCurrentWeather(): Promise<CurrentWeather | null> {
  return new Promise((resolve) => {
    const load = (lat: number, lon: number) =>
      fetchAt(lat, lon)
        .then(resolve)
        .catch(() => resolve(null));

    if (typeof navigator !== "undefined" && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => load(pos.coords.latitude, pos.coords.longitude),
        () => load(FALLBACK.lat, FALLBACK.lon),
        { timeout: 8000 },
      );
    } else {
      load(FALLBACK.lat, FALLBACK.lon);
    }
  });
}

// A short weather phrase like "clear and sunny, 31°C" (or "" if unavailable).
export async function getWeatherSummary(): Promise<string> {
  const w = await getCurrentWeather();
  if (!w) return "";
  return `${describeWeatherCode(w.code)}, ${w.temp}°C`;
}
