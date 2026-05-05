"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import type { Locale } from "@/lib/i18n";

interface LanguageSwitchProps {
  locale: Locale;
}

export function LanguageSwitch({ locale }: LanguageSwitchProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const target = locale === "zh" ? "en" : "zh";
  const label = target === "zh" ? "简体中文" : "English";
  const nextPath = pathname.replace(/^\/(zh|en)(?=\/|$)/, `/${target}`) || `/${target}`;
  const query = searchParams.toString();
  const href = query ? `${nextPath}?${query}` : nextPath;

  return (
    <Link
      href={href}
      className="language-switch"
    >
      {label}
    </Link>
  );
}
