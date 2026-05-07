"use client";

import { useEffect, useState } from "react";
import type { Locale } from "@/lib/i18n";

const SESSION_KEY = "portfolio_visit_counted";

interface VisitCounterProps {
  locale: Locale;
  variant?: "pill" | "inline";
}

async function requestVisits(method: "GET" | "POST"): Promise<number | null> {
  const response = await fetch("/api/metrics/visits", {
    method,
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as { visits?: unknown; enabled?: unknown };
  if (payload.enabled === false || typeof payload.visits !== "number") {
    return null;
  }

  return payload.visits;
}

export function VisitCounter({ locale, variant = "pill" }: VisitCounterProps) {
  const [visits, setVisits] = useState<number | null>(null);

  useEffect(() => {
    let active = true;

    async function syncVisits() {
      const alreadyCounted = window.sessionStorage.getItem(SESSION_KEY) === "1";
      const nextVisits = await requestVisits(alreadyCounted ? "GET" : "POST");

      if (!active) {
        return;
      }

      if (nextVisits !== null && !alreadyCounted) {
        window.sessionStorage.setItem(SESSION_KEY, "1");
      }

      setVisits(nextVisits);
    }

    void syncVisits();

    const interval = window.setInterval(async () => {
      const nextVisits = await requestVisits("GET");
      if (active) {
        setVisits(nextVisits);
      }
    }, 60_000);

    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, []);

  if (visits === null) {
    return <span className="opacity-0">-</span>;
  }

  const formatted = new Intl.NumberFormat(locale === "zh" ? "zh-CN" : "en-US").format(visits);
  const label = locale === "zh" ? `已被访问 ${formatted} 次` : `${formatted} visits`;

  if (variant === "inline") {
    return <span>{label}</span>;
  }

  return (
    <div
      className="mt-3 inline-flex rounded-full px-3 py-1 text-xs"
      style={{
        border: "1px solid var(--line-muted)",
        background: "var(--button-bg)",
        color: "var(--text-soft)",
      }}
    >
      {label}
    </div>
  );
}
