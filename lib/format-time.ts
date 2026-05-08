import type { Locale } from "@/lib/i18n";

export function formatTime(ts: number, locale: Locale): string {
  return new Date(ts).toLocaleString(locale === "zh" ? "zh-CN" : "en-US", {
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
