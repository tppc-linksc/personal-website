"use client";

import type { ReplyEditorProps } from "./message-board-types";

export function ReplyEditor({
  dict,
  canPostAsOwner,
  nickname,
  onNicknameChange,
  content,
  onContentChange,
  submitting,
  error,
  onCancel,
  onSubmit,
}: ReplyEditorProps) {
  return (
    <div className="rounded-xl border border-[var(--line)] bg-[var(--panel-strong)] p-3">
      {!canPostAsOwner && (
        <input
          value={nickname}
          onChange={(e) => onNicknameChange(e.target.value)}
          placeholder={dict.nicknamePlaceholder}
          className="form-field text-sm"
        />
      )}
      <textarea
        value={content}
        onChange={(e) => onContentChange(e.target.value)}
        placeholder={dict.contentPlaceholder}
        rows={3}
        className="form-field mt-2 text-sm"
      />
      <div className="mt-2 flex items-center justify-between">
        <button type="button" onClick={onCancel} className="text-xs text-[var(--text-soft)] transition hover:text-[var(--text-main)]">
          {dict.cancelReply}
        </button>
        <div className="flex items-center gap-3">
          {error && <span className="text-xs text-red-500">{error}</span>}
          <button
            type="button"
            onClick={onSubmit}
            disabled={submitting}
            className="rounded-lg border border-[var(--line-muted)] bg-[var(--button-bg)] px-3 py-1.5 text-xs text-[var(--text-main)] transition hover:border-[var(--text-muted)] disabled:opacity-50"
          >
            {submitting ? dict.submitting : dict.submit}
          </button>
        </div>
      </div>
    </div>
  );
}
