"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function StudioLoginPage() {
  const router = useRouter();

  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/studio/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      const json = (await res.json()) as { error?: string };
      if (!res.ok) {
        throw new Error(json.error ?? "登录失败");
      }

      const from = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("from") : null;
      const safeFrom = from && from.startsWith("/") && !from.startsWith("//") ? from : "/studio";
      router.replace(safeFrom);
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "登录失败");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen px-4 py-8 md:px-8">
      <div className="mx-auto mt-16 max-w-md rounded-2xl border border-[var(--line)] bg-[var(--panel-bg)] p-6 backdrop-blur shadow-[var(--shadow)]">
        <h1 className="text-xl font-semibold">Studio Login</h1>
        <p className="mt-2 text-sm text-[var(--text-muted)]">输入 `STUDIO_ADMIN_TOKEN` 进入项目管理后台。</p>

        <form className="mt-5 space-y-3" onSubmit={handleSubmit}>
          <input
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="STUDIO_ADMIN_TOKEN"
            className="w-full rounded-xl border border-[var(--line)] bg-[var(--button-bg)] px-3 py-2 text-sm outline-none ring-[var(--accent-border)] focus:ring"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl border border-[var(--accent-border)] bg-[var(--accent-soft)] px-4 py-2 text-sm text-[var(--accent-text)] transition hover:bg-[var(--accent-soft)] disabled:opacity-50"
          >
            {loading ? "登录中..." : "登录"}
          </button>
        </form>

        {message && <p className="mt-3 text-sm text-[var(--danger-text)]">{message}</p>}
      </div>
    </main>
  );
}
