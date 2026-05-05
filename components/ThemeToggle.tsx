"use client";

import { useEffect, useSyncExternalStore } from "react";

type Theme = "light" | "dark";

const THEME_STORAGE_KEY = "portfolio-theme";
const THEME_CHANGE_EVENT = "portfolio-theme-change";

function getStoredTheme(): Theme {
  if (typeof window === "undefined") {
    return "light";
  }
  return window.localStorage.getItem(THEME_STORAGE_KEY) === "dark" ? "dark" : "light";
}

function subscribeTheme(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(THEME_CHANGE_EVENT, callback);

  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(THEME_CHANGE_EVENT, callback);
  };
}

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
}

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribeTheme, getStoredTheme, () => "light");

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  return (
    <button
      type="button"
      aria-label="Toggle color theme"
      onClick={() => {
        const next = theme === "light" ? "dark" : "light";
        applyTheme(next);
      }}
      style={{
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "space-between",
        width: 80,
        height: 34,
        padding: 0,
        overflow: "hidden",
        borderRadius: 999,
        border: "0",
        background:
          theme === "dark"
            ? "linear-gradient(145deg, rgba(34,39,48,0.92), rgba(24,28,36,0.96))"
            : "linear-gradient(145deg, rgba(238,241,246,0.94), rgba(226,230,237,0.9))",
        boxShadow:
          theme === "dark"
            ? "inset 0 0 0 1px rgba(255,255,255,0.06), inset 0 -1px 2px rgba(0,0,0,0.22)"
            : "inset 0 0 0 1px rgba(20,24,35,0.08)",
        cursor: "pointer",
      }}
    >
      <span
        style={{
          position: "absolute",
          left: 2,
          top: 2,
          width: 40,
          height: 30,
          borderRadius: 999,
          border: "0",
          background:
            theme === "dark"
              ? "linear-gradient(145deg, rgba(45,51,62,0.98), rgba(29,34,43,0.98))"
              : "linear-gradient(145deg, #ffffff, #f7f8fb)",
          boxShadow:
            theme === "dark"
              ? "0 5px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)"
              : "0 3px 8px rgba(20,24,35,0.1), inset 0 1px 0 rgba(255,255,255,0.98)",
          transform: theme === "dark" ? "translateX(36px)" : "translateX(0)",
          transition: "transform 180ms ease, background 180ms ease, box-shadow 180ms ease",
        }}
      />
      <span
        style={{
          position: "relative",
          zIndex: 1,
          width: 40,
          height: 34,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          style={{
            width: 19,
            height: 19,
            color: theme === "light" ? "#f6b72f" : "rgba(159,167,180,0.48)",
            filter: theme === "light" ? "drop-shadow(0 1px 2px rgba(246,183,47,0.25))" : "none",
            transition: "color 180ms ease, filter 180ms ease",
          }}
        >
          <circle cx="12" cy="12" r="4.2" fill="currentColor" />
          <path
            d="M12 2.8v2.4M12 18.8v2.4M4.2 4.2l1.7 1.7M18.1 18.1l1.7 1.7M2.8 12h2.4M18.8 12h2.4M4.2 19.8l1.7-1.7M18.1 5.9l1.7-1.7"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="1.8"
          />
        </svg>
      </span>
      <span
        style={{
          position: "relative",
          zIndex: 1,
          width: 40,
          height: 34,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          style={{
            width: 19,
            height: 19,
            color: theme === "dark" ? "#b8d4ff" : "#9aa2ad",
            filter: theme === "dark" ? "drop-shadow(0 0 6px rgba(137,181,255,0.38))" : "none",
            transition: "color 180ms ease, filter 180ms ease",
          }}
        >
          <path
            d="M19.2 15.1A7.6 7.6 0 0 1 8.9 4.8 8.1 8.1 0 1 0 19.2 15.1Z"
            fill="currentColor"
          />
        </svg>
      </span>
    </button>
  );
}
