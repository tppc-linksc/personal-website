"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center px-4 text-[var(--text-main)]">
      <div className="text-center">
        <h1 className="text-2xl font-semibold">出错了</h1>
        <p className="mt-3 text-sm text-[var(--text-muted)]">
          页面加载时发生了意外错误，请稍后重试。
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-6 rounded-full border border-[var(--line-muted)] px-5 py-2 text-sm transition hover:border-[var(--text-muted)]"
        >
          重试
        </button>
      </div>
    </main>
  );
}
