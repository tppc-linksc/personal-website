"use client";

import { useSyncExternalStore } from "react";
import type { SiteContent } from "@/lib/site-content";
import { defaultContent, getContent, subscribeContent } from "@/lib/site-content";

export function useSiteContent(): SiteContent {
  return useSyncExternalStore(subscribeContent, getContent, () => defaultContent);
}
