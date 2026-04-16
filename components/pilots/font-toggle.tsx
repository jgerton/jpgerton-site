"use client";

import { useState, useEffect } from "react";

const STORAGE_KEY = "pilots-font-preference";

export function FontToggle() {
  const [font, setFont] = useState<"serif" | "sans">("serif");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "sans") setFont("sans");
  }, []);

  function toggle(next: "serif" | "sans") {
    setFont(next);
    localStorage.setItem(STORAGE_KEY, next);
    // Toggle class on the docs content wrapper
    const wrapper = document.querySelector("[data-font-toggle]");
    if (wrapper) {
      wrapper.classList.toggle("font-sans-override", next === "sans");
    }
  }

  return (
    <div className="flex items-center gap-1 rounded-md border border-border p-0.5" role="radiogroup" aria-label="Reading font">
      <button
        type="button"
        role="radio"
        aria-checked={font === "serif"}
        aria-label="Serif font"
        onClick={() => toggle("serif")}
        className={`flex items-center justify-center rounded px-2 py-1 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
          font === "serif"
            ? "bg-primary/10 text-primary font-medium"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <span className="font-serif tracking-tight">Aa</span>
      </button>
      <button
        type="button"
        role="radio"
        aria-checked={font === "sans"}
        aria-label="Sans-serif font"
        onClick={() => toggle("sans")}
        className={`flex items-center justify-center rounded px-2 py-1 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
          font === "sans"
            ? "bg-primary/10 text-primary font-medium"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <span className="font-heading tracking-normal">Aa</span>
      </button>
    </div>
  );
}
