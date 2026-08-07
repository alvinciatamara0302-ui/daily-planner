// The Weather Widget: shows today's weather using the free Open-Meteo API
// (no API key needed). It tries the browser's location, and falls back to
// a default city if location access is denied.
"use client";

import { useEffect, useState } from "react";
import {
  Sun,
  Cloud,
  CloudSun,
  CloudFog,
  CloudDrizzle,
  CloudRain,
  CloudSnow,
  CloudLightning,
  type LucideIcon,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

// A fallback location (used if the browser won't share location).
const FALLBACK = { lat: -6.2, lon: 106.8, label: "Jakarta" };

// Turn an Open-Meteo weather code into a friendly label + icon.
function describeWeather(code: number): { label: string; icon: LucideIcon } {
  if (code === 0) return { label: "Clear sky", icon: Sun };
  if (code === 1 || code === 2) return { label: "Partly cloudy", icon: CloudSun };
  if (code === 3) return { label: "Overcast", icon: Cloud };
  if (code === 45 || code === 48) return { label: "Foggy", icon: CloudFog };
  if (code >= 51 && code <= 57) return { label: "Drizzle", icon: CloudDrizzle };
  if (code >= 61 && code <= 67) return { label: "Rainy", icon: CloudRain };
  if (code >= 71 && code <= 77) return { label: "Snowy", icon: CloudSnow };
  if (code >= 80 && code <= 82) return { label: "Rain showers", icon: CloudRain };
  if (code === 85 || code === 86) return { label: "Snow showers", icon: CloudSnow };
  if (code >= 95) return { label: "Thunderstorm", icon: CloudLightning };
  return { label: "Cloudy", icon: Cloud };
}

// The shape of the weather info we keep in state.
type Weather = {
  temp: number;
  code: number;
  high: number;
  low: number;
  label: string;
};

export function WeatherWidget() {
  const [weather, setWeather] = useState<Weather | null>(null);
  const [status, setStatus] = useState<"loading" | "error" | "ready">("loading");

  useEffect(() => {
    // Fetch weather for a given latitude/longitude and place name.
    async function load(lat: number, lon: number, label: string) {
      try {
        const url =
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
          `&current=temperature_2m,weather_code` +
          `&daily=temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=1`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("Weather request failed");
        const data = await res.json();
        setWeather({
          temp: Math.round(data.current.temperature_2m),
          code: data.current.weather_code,
          high: Math.round(data.daily.temperature_2m_max[0]),
          low: Math.round(data.daily.temperature_2m_min[0]),
          label,
        });
        setStatus("ready");
      } catch {
        setStatus("error");
      }
    }

    // Ask the browser for the user's location. If denied, use the fallback.
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => load(pos.coords.latitude, pos.coords.longitude, "Your location"),
        () => load(FALLBACK.lat, FALLBACK.lon, FALLBACK.label),
        { timeout: 8000 },
      );
    } else {
      load(FALLBACK.lat, FALLBACK.lon, FALLBACK.label);
    }
  }, []);

  // ---------- Render ----------
  if (status === "loading") {
    return (
      <Card>
        <CardContent className="py-5 text-sm text-muted-foreground">
          Loading weather…
        </CardContent>
      </Card>
    );
  }

  if (status === "error" || !weather) {
    return (
      <Card>
        <CardContent className="py-5 text-sm text-muted-foreground">
          Weather unavailable right now.
        </CardContent>
      </Card>
    );
  }

  const { label, icon: Icon } = describeWeather(weather.code);

  return (
    <Card>
      <CardContent className="flex items-center gap-4 py-5">
        <Icon className="h-10 w-10 text-primary" />
        <div className="flex-1">
          <div className="text-2xl font-bold">{weather.temp}°C</div>
          <div className="text-sm text-muted-foreground">{label}</div>
        </div>
        <div className="text-right text-sm text-muted-foreground">
          <div>{weather.label}</div>
          <div>
            H: {weather.high}° L: {weather.low}°
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
