"use client";

export function BackLink({ locale }: { locale: string }) {
  return (
    <button
      type="button"
      onClick={() => {
        if (window.history.length > 1) {
          window.history.back();
        }
      }}
      className="text-sm text-[var(--text-muted)] transition hover:text-[var(--text-main)]"
    >
      ← {locale === "zh" ? "返回" : "Back"}
    </button>
  );
}
