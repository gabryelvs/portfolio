"use client";

import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  function toggle() {
    const current = document.documentElement.classList.contains("light");
    const next = !current;
    document.documentElement.classList.toggle("light", next);
    localStorage.setItem("theme", next ? "light" : "dark");
  }

  if (!mounted) {
    return (
      <button
        type="button"
        disabled
        aria-label="Toggle theme"
        className="rounded-lg border border-white/15 px-3 py-1.5 text-sm hover:bg-white/10"
      >
        ☀ Light
      </button>
    );
  }

  const light = document.documentElement.classList.contains("light");

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle theme"
      className="rounded-lg border border-white/15 px-3 py-1.5 text-sm hover:bg-white/10"
    >
      {light ? "🌙 Dark" : "☀ Light"}
    </button>
  );
}
