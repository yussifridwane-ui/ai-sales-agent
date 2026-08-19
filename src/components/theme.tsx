"use client";

import { useEffect, useState } from "react";

export type ThemeMode = "light" | "dark" | "system";

function apply(mode: ThemeMode) {
  const sysDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const dark = mode === "dark" || (mode === "system" && sysDark);
  document.documentElement.classList.toggle("dark", dark);
  document.documentElement.dataset.theme = mode;
}

export function ThemeScript() {
  const code = `(()=>{try{const m=localStorage.getItem("ais-theme")||"system";const d=m==="dark"||(m==="system"&&matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",d);}catch(e){}})();`;
  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}

export function ThemeToggle() {
  const [mode, setMode] = useState<ThemeMode>("system");
  useEffect(() => {
    const stored = (localStorage.getItem("ais-theme") as ThemeMode) || "system";
    setMode(stored);
    apply(stored);
  }, []);

  function cycle() {
    const next: ThemeMode = mode === "light" ? "dark" : mode === "dark" ? "system" : "light";
    setMode(next);
    localStorage.setItem("ais-theme", next);
    apply(next);
  }

  return (
    <button type="button" className="btn btn-ghost px-3 text-sm" onClick={cycle} aria-label={`Thème : ${mode}`}>
      {mode === "light" ? "Clair" : mode === "dark" ? "Sombre" : "Système"}
    </button>
  );
}
