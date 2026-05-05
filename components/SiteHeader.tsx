"use client";

import Link from "next/link";
import { useState } from "react";
import { LanguageSwitch } from "@/components/LanguageSwitch";
import { ThemeToggle } from "@/components/ThemeToggle";
import type { Locale } from "@/lib/i18n";

interface SiteHeaderProps {
  locale: Locale;
  brand?: string;
  center?: React.ReactNode;
  nav?: { label: string; href: string }[];
}

export function SiteHeader({ locale, brand = "tppc_linksc", center, nav }: SiteHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="glass-panel sticky top-3 z-30 overflow-hidden rounded-[30px] px-5 py-3 md:px-6">
      <div className="flex items-center justify-between gap-3">
        <Link href={`/${locale}`} className="text-lg font-semibold text-[var(--text-main)] shrink-0">
          {brand}
        </Link>

        {center && <div className="hidden min-w-0 flex-1 justify-center lg:flex">{center}</div>}

        {nav && (
          <nav className="hidden items-center gap-8 text-sm text-[var(--text-muted)] lg:flex">
            {nav.map((item) => (
              <a key={item.href} href={item.href} className="transition hover:text-[var(--text-main)]">
                {item.label}
              </a>
            ))}
          </nav>
        )}

        <div className="flex items-center gap-2">
          {nav && (
            <button
              type="button"
              aria-label="Toggle menu"
              onClick={() => setMenuOpen((v) => !v)}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--line-muted)] bg-[var(--button-bg)] transition hover:border-[var(--text-muted)] lg:hidden"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                {menuOpen ? (
                  <>
                    <line x1="3" y1="3" x2="13" y2="13" />
                    <line x1="13" y1="3" x2="3" y2="13" />
                  </>
                ) : (
                  <>
                    <line x1="2" y1="4" x2="14" y2="4" />
                    <line x1="2" y1="8" x2="14" y2="8" />
                    <line x1="2" y1="12" x2="14" y2="12" />
                  </>
                )}
              </svg>
            </button>
          )}
          <LanguageSwitch locale={locale} />
          <ThemeToggle />
        </div>
      </div>

      {center && <div className="mt-2 text-center lg:hidden">{center}</div>}

      {nav && menuOpen && (
        <nav className="mt-3 flex flex-col gap-1 border-t border-[var(--line-muted)] pt-3 lg:hidden">
          {nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className="rounded-lg px-3 py-2 text-sm text-[var(--text-muted)] transition hover:bg-[var(--chip-bg)] hover:text-[var(--text-main)]"
            >
              {item.label}
            </a>
          ))}
        </nav>
      )}
    </header>
  );
}
