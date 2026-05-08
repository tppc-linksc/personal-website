import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 text-[var(--text-main)]">
      <div className="text-center">
        <h1 className="text-6xl font-semibold">404</h1>
        <p className="mt-3 text-sm text-[var(--text-muted)]">
          页面不存在或已被移除
        </p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-full border border-[var(--line-muted)] px-5 py-2 text-sm transition hover:border-[var(--text-muted)]"
        >
          返回首页
        </Link>
      </div>
    </main>
  );
}
