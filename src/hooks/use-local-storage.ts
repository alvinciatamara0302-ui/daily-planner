// A custom hook that works like React's useState, but also saves the
// value in the browser's localStorage so it survives page refreshes.
"use client";

import { useCallback, useEffect, useState } from "react";

export function useLocalStorage<T>(key: string, initialValue: T) {
  // The value we show. Starts as `initialValue` so the server and the
  // first client render match (this avoids "hydration" warnings).
  const [value, setValue] = useState<T>(initialValue);

  // `loaded` becomes true after we've read the saved value from the
  // browser. Useful to avoid showing "empty" before data is read.
  const [loaded, setLoaded] = useState(false);

  // 1) On first load, read the saved value from localStorage.
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(key);
      if (stored !== null) {
        setValue(JSON.parse(stored) as T);
      }
    } catch {
      // Ignore read/parse errors and keep the initial value.
    }
    setLoaded(true);
  }, [key]);

  // 2) Whenever the value changes (after loading), save it.
  useEffect(() => {
    if (!loaded) return; // don't overwrite storage before we've read it
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
      // Tell other components on this page that this key changed,
      // so they can refresh too.
      window.dispatchEvent(new CustomEvent("dp-storage", { detail: key }));
    } catch {
      // Ignore write errors (e.g. storage full or disabled).
    }
  }, [key, value, loaded]);

  // 3) Keep in sync when the same key changes elsewhere:
  //    - "storage" event: another browser tab changed it
  //    - "dp-storage" event: another component on this page changed it
  useEffect(() => {
    function reread() {
      try {
        const stored = window.localStorage.getItem(key);
        const next = stored !== null ? (JSON.parse(stored) as T) : initialValue;
        // Only update if it actually changed, to avoid update loops.
        setValue((prev) =>
          JSON.stringify(prev) === JSON.stringify(next) ? prev : next,
        );
      } catch {
        // Ignore.
      }
    }
    function onStorage(e: StorageEvent) {
      if (e.key === key) reread();
    }
    function onCustom(e: Event) {
      if ((e as CustomEvent).detail === key) reread();
    }
    window.addEventListener("storage", onStorage);
    window.addEventListener("dp-storage", onCustom);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("dp-storage", onCustom);
    };
    // We intentionally depend only on `key`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  // A convenience helper so callers can reset to the initial value.
  const reset = useCallback(() => setValue(initialValue), [initialValue]);

  return { value, setValue, loaded, reset };
}
