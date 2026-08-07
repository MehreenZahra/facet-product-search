"use client";

import { useEffect, useState } from "react";

export default function DarkModeToggle() {
  const [isDark, setIsDark] = useState<boolean | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("theme");
      if (stored === "dark") {
        document.documentElement.classList.add("dark");
        setIsDark(true);
        return;
      }
      if (stored === "light") {
        document.documentElement.classList.remove("dark");
        setIsDark(false);
        return;
      }
      const prefersDark =
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (prefersDark) {
        document.documentElement.classList.add("dark");
        setIsDark(true);
      } else {
        document.documentElement.classList.remove("dark");
        setIsDark(false);
      }
    } catch (e) {
      setIsDark(false);
    }
  }, []);

  function toggle() {
    const next = !isDark;
    setIsDark(next);
    try {
      if (next) {
        document.documentElement.classList.add("dark");
        localStorage.setItem("theme", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("theme", "light");
      }
    } catch (e) {
      /* ignore */
    }
  }

  return (
    <button
      aria-pressed={!!isDark}
      onClick={toggle}
      className="inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
      title="Toggle dark mode"
    >
      <span className="text-lg">{isDark ? "🌙" : "☀️"}</span>
      <span className="hidden sm:inline">{isDark ? "Dark" : "Light"}</span>
    </button>
  );
}
