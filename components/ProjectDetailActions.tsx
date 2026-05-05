"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

interface ProjectDetailActionsProps {
  homeHref: string;
  fallbackHref: string;
  labels: {
    home: string;
    back: string;
    top: string;
  };
}

const actionStyle = {
  border: "1px solid var(--line-muted)",
  background: "var(--button-bg)",
  color: "var(--text-main)",
} as const;

const actionClass =
  "flex h-11 w-11 cursor-pointer items-center justify-center rounded-full shadow-sm backdrop-blur transition hover:border-[var(--text-muted)] hover:bg-[var(--panel-strong)]";

export function ProjectDetailActions({ homeHref, fallbackHref, labels }: ProjectDetailActionsProps) {
  const router = useRouter();

  return (
    <div className="fixed bottom-5 right-4 z-40 flex flex-col gap-2 md:bottom-8 md:right-8">
      <Link
        href={homeHref}
        aria-label={labels.home}
        title={labels.home}
        className={actionClass}
        style={actionStyle}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
          <path
            d="M4.5 10.8 12 4.6l7.5 6.2v8.1a1.5 1.5 0 0 1-1.5 1.5h-3.7v-5.6H9.7v5.6H6a1.5 1.5 0 0 1-1.5-1.5v-8.1Z"
            fill="none"
            stroke="currentColor"
            strokeLinejoin="round"
            strokeWidth="1.8"
          />
        </svg>
      </Link>
      <button
        type="button"
        aria-label={labels.back}
        title={labels.back}
        onClick={() => {
          if (window.history.length > 1) {
            router.back();
            return;
          }
          router.push(fallbackHref);
        }}
        className={actionClass}
        style={actionStyle}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
          <path
            d="M10.5 6 5 11.5l5.5 5.5"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.9"
          />
          <path
            d="M5.4 11.5h8.2c3.3 0 5.4 1.8 5.4 4.8v1.2"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.9"
          />
        </svg>
      </button>
      <button
        type="button"
        aria-label={labels.top}
        title={labels.top}
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className={actionClass}
        style={actionStyle}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
          <path
            d="M6 5h12"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="1.9"
          />
          <path
            d="m12 18-.1-10.2M7.8 11.9 12 7.7l4.2 4.2"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.9"
          />
        </svg>
      </button>
    </div>
  );
}
