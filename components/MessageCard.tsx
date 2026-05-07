"use client";

import { formatTime } from "./message-board-types";
import type { MessageCardProps } from "./message-board-types";

export function MessageCard({ item, locale, dict, replyTo, onReply }: MessageCardProps) {
  return (
    <div className="rounded-2xl border border-[var(--line)] bg-[var(--panel-strong)] p-4">
      <div className="flex items-center gap-2">
        <div className="text-sm font-medium text-[var(--text-main)]">{item.nickname}</div>
        {item.authorType === "owner" && (
          <span className="rounded-full border border-[var(--line-muted)] bg-[var(--chip-bg)] px-2 py-0.5 text-[10px] text-[var(--text-muted)]">
            {dict.ownerTag}
          </span>
        )}
      </div>
      <div className="mt-1 text-xs text-[var(--text-soft)]">{formatTime(item.createdAt, locale)}</div>
      {replyTo && <div className="mt-2 text-xs text-[var(--text-muted)]">{dict.replyTo} @{replyTo}</div>}
      <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-[var(--text-muted)]">{item.content}</p>
      <button
        type="button"
        onClick={() => onReply(item.id)}
        className="mt-3 text-xs text-[var(--text-soft)] transition hover:text-[var(--text-main)]"
      >
        {dict.reply}
      </button>
    </div>
  );
}
