import { Suspense } from "react";
import { getContent } from "@/lib/site-content";
import { ContentEditor } from "@/components/ContentEditor";
import { SiteHeader } from "@/components/SiteHeader";

export const dynamic = "force-dynamic";

export default function ContentPage() {
  const content = getContent();

  return (
    <main className="min-h-screen px-3 py-4 text-[var(--text-main)] md:px-6">
      <div className="mx-auto max-w-4xl">
        <Suspense fallback={<div className="h-16" />}>
          <SiteHeader locale="zh" brand="内容管理" />
        </Suspense>

        <ContentEditor initialContent={content} />
      </div>
    </main>
  );
}
