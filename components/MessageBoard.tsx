"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Locale } from "@/lib/i18n";
import type { MessageItem, MessageNode } from "@/lib/messages";

interface MessageBoardDict {
  title: string;
  subtitle: string;
  nickname: string;
  nicknamePlaceholder: string;
  content: string;
  contentPlaceholder: string;
  submit: string;
  submitting: string;
  reply: string;
  cancelReply: string;
  ownerTag: string;
  empty: string;
  sortLabel: string;
  sortTime: string;
  sortHot: string;
  replyTo: string;
  replies: string;
}

interface MessageBoardProps {
  slug: string;
  locale: Locale;
  dict: MessageBoardDict;
}

type SortMode = "time" | "hot";

interface FlatReply {
  node: MessageNode;
  replyTo?: string;
}

async function safeJson<T>(res: Response): Promise<T | null> {
  const text = await res.text();
  if (!text.trim()) {
    return null;
  }
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

function toNode(item: MessageItem): MessageNode {
  return { ...item, replies: [] };
}

function appendMessageNode(tree: MessageNode[], message: MessageItem): MessageNode[] {
  const node = toNode(message);
  if (!message.parentId) {
    return [...tree, node];
  }

  function walk(items: MessageNode[]): MessageNode[] {
    return items.map((item) => {
      if (item.id === message.parentId) {
        return { ...item, replies: [...item.replies, node] };
      }
      if (item.replies.length === 0) {
        return item;
      }
      return { ...item, replies: walk(item.replies) };
    });
  }

  return walk(tree);
}

function formatTime(ts: number, locale: Locale): string {
  return new Date(ts).toLocaleString(locale === "zh" ? "zh-CN" : "en-US", {
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function countReplies(node: MessageNode): number {
  return node.replies.reduce((acc, item) => acc + 1 + countReplies(item), 0);
}

function buildNicknameIndex(nodes: MessageNode[]): Map<string, string> {
  const map = new Map<string, string>();

  function walk(items: MessageNode[]) {
    for (const item of items) {
      map.set(item.id, item.nickname);
      walk(item.replies);
    }
  }

  walk(nodes);
  return map;
}

function flattenReplies(items: MessageNode[], index: Map<string, string>): FlatReply[] {
  const output: FlatReply[] = [];

  function walk(list: MessageNode[]) {
    for (const item of list) {
      output.push({
        node: item,
        replyTo: item.parentId ? index.get(item.parentId) : undefined,
      });
      walk(item.replies);
    }
  }

  walk(items);
  return output;
}

function MessageCard({
  item,
  locale,
  dict,
  replyTo,
  onReply,
}: {
  item: MessageNode;
  locale: Locale;
  dict: MessageBoardDict;
  replyTo?: string;
  onReply: (targetId: string) => void;
}) {
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

function ReplyEditor({
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
}: {
  dict: MessageBoardDict;
  canPostAsOwner: boolean;
  nickname: string;
  onNicknameChange: (value: string) => void;
  content: string;
  onContentChange: (value: string) => void;
  submitting: boolean;
  error: string;
  onCancel: () => void;
  onSubmit: () => void;
}) {
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

export function MessageBoard({ slug, locale, dict }: MessageBoardProps) {
  const [messages, setMessages] = useState<MessageNode[]>([]);
  const [nickname, setNickname] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [canPostAsOwner, setCanPostAsOwner] = useState(false);
  const [sortMode, setSortMode] = useState<SortMode>("time");

  const [replyTargetId, setReplyTargetId] = useState<string>("");
  const [replyNickname, setReplyNickname] = useState("");
  const [replyContent, setReplyContent] = useState("");
  const [replySubmitting, setReplySubmitting] = useState(false);
  const [replyError, setReplyError] = useState("");

  const apiUrl = useMemo(() => `/api/projects/${slug}/messages`, [slug]);
  const nicknameIndex = useMemo(() => buildNicknameIndex(messages), [messages]);

  const sortedRoots = useMemo(() => {
    const roots = [...messages];

    if (sortMode === "hot") {
      roots.sort((a, b) => {
        const hotDelta = countReplies(b) - countReplies(a);
        if (hotDelta !== 0) {
          return hotDelta;
        }
        return b.createdAt - a.createdAt;
      });
      return roots;
    }

    roots.sort((a, b) => b.createdAt - a.createdAt);
    return roots;
  }, [messages, sortMode]);

  const loadMessages = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(apiUrl, { cache: "no-store" });
      const json = await safeJson<{ messages?: MessageNode[]; canPostAsOwner?: boolean; error?: string }>(res);
      if (!res.ok) {
        throw new Error(json?.error ?? "Load failed");
      }
      setMessages(json?.messages ?? []);
      setCanPostAsOwner(Boolean(json?.canPostAsOwner));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Load failed");
    } finally {
      setLoading(false);
    }
  }, [apiUrl]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadMessages();
    }, 0);
    return () => {
      window.clearTimeout(timer);
    };
  }, [loadMessages]);

  async function sendMessage(payload: { parentId?: string; nickname?: string; content: string }) {
    const res = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const json = await safeJson<{ error?: string; message?: MessageItem }>(res);
    if (!res.ok) {
      throw new Error(json?.error ?? "Submit failed");
    }

    if (json?.message) {
      setMessages((prev) => appendMessageNode(prev, json.message as MessageItem));
      // Keep UI responsive with optimistic update, then reconcile with server data
      // so newly created nodes are always in the same shape as fetched nodes.
      void loadMessages();
      return;
    }

    await loadMessages();
  }

  async function submitRoot() {
    const payload = {
      nickname: nickname.trim(),
      content: content.trim(),
    };
    if (!payload.content) {
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      await sendMessage(payload);
      setContent("");
      if (!canPostAsOwner) {
        setNickname("");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Submit failed");
    } finally {
      setSubmitting(false);
    }
  }

  async function submitReply() {
    const payload = {
      parentId: replyTargetId,
      nickname: replyNickname.trim(),
      content: replyContent.trim(),
    };
    if (!payload.parentId || !payload.content) {
      return;
    }

    setReplySubmitting(true);
    setReplyError("");
    try {
      await sendMessage(payload);
      setReplyContent("");
      setReplyNickname("");
      setReplyTargetId("");
    } catch (e) {
      setReplyError(e instanceof Error ? e.message : "Submit failed");
    } finally {
      setReplySubmitting(false);
    }
  }

  function openReply(targetId: string) {
    if (!targetId) {
      return;
    }
    setReplyTargetId((prev) => (prev === targetId ? "" : targetId));
    setReplyError("");
    setReplyContent("");
    if (!canPostAsOwner) {
      setReplyNickname("");
    }
  }

  return (
    <section className="mt-10">
      <h2 className="text-sm text-[var(--text-main)]">{dict.title}</h2>
      <p className="mt-2 text-sm text-[var(--text-muted)]">{dict.subtitle}</p>

      <div className="mt-4 rounded-2xl border border-[var(--line)] bg-[var(--panel-strong)] p-4">
        {!canPostAsOwner && (
          <label className="block text-sm">
            <div className="mb-1 text-[var(--text-muted)]">{dict.nickname}</div>
            <input
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder={dict.nicknamePlaceholder}
              className="form-field text-sm"
            />
          </label>
        )}

        <label className="mt-3 block text-sm">
          <div className="mb-1 text-[var(--text-muted)]">{dict.content}</div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={dict.contentPlaceholder}
            rows={4}
            className="form-field text-sm"
          />
        </label>

        <div className="mt-3 flex items-center justify-between">
          {error ? <span className="text-xs text-red-500">{error}</span> : <span />}
          <button
            type="button"
            onClick={() => void submitRoot()}
            disabled={submitting}
            className="rounded-xl border border-[var(--line-muted)] bg-[var(--button-bg)] px-4 py-2 text-sm text-[var(--text-main)] transition hover:border-[var(--text-muted)] disabled:opacity-50"
          >
            {submitting ? dict.submitting : dict.submit}
          </button>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between">
        <div className="text-xs text-[var(--text-muted)]">{dict.sortLabel}</div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSortMode("time")}
            className={`rounded-full border px-3 py-1 text-xs transition ${
              sortMode === "time" ? "border-[var(--text-muted)] bg-[var(--button-bg)] text-[var(--text-main)]" : "border-[var(--line-muted)] text-[var(--text-muted)]"
            }`}
          >
            {dict.sortTime}
          </button>
          <button
            type="button"
            onClick={() => setSortMode("hot")}
            className={`rounded-full border px-3 py-1 text-xs transition ${
              sortMode === "hot" ? "border-[var(--text-muted)] bg-[var(--button-bg)] text-[var(--text-main)]" : "border-[var(--line-muted)] text-[var(--text-muted)]"
            }`}
          >
            {dict.sortHot}
          </button>
        </div>
      </div>

      <div className="mt-3 space-y-4">
        {loading && <div className="text-sm text-[var(--text-muted)]">Loading...</div>}
        {!loading && sortedRoots.length === 0 && <div className="text-sm text-[var(--text-muted)]">{dict.empty}</div>}

        {sortedRoots.map((root) => {
          const flatReplies = flattenReplies(root.replies, nicknameIndex);
          const replyCount = countReplies(root);

          return (
            <div key={root.id} className="space-y-3 rounded-2xl border border-[var(--line)] bg-[var(--panel-soft)] p-3">
              <MessageCard item={root} locale={locale} dict={dict} onReply={openReply} />

              {replyTargetId === root.id && (
                <ReplyEditor
                  dict={dict}
                  canPostAsOwner={canPostAsOwner}
                  nickname={replyNickname}
                  onNicknameChange={setReplyNickname}
                  content={replyContent}
                  onContentChange={setReplyContent}
                  submitting={replySubmitting}
                  error={replyError}
                  onCancel={() => setReplyTargetId("")}
                  onSubmit={() => void submitReply()}
                />
              )}

              {replyCount > 0 && <div className="px-2 text-xs text-[var(--text-soft)]">{replyCount} {dict.replies}</div>}

              {flatReplies.length > 0 && (
                <div className="space-y-2 border-l border-[var(--line-muted)] pl-3">
                  {flatReplies.map(({ node, replyTo }) => (
                    <div key={node.id} className="space-y-2">
                      <MessageCard item={node} locale={locale} dict={dict} replyTo={replyTo} onReply={openReply} />
                      {replyTargetId === node.id && (
                        <ReplyEditor
                          dict={dict}
                          canPostAsOwner={canPostAsOwner}
                          nickname={replyNickname}
                          onNicknameChange={setReplyNickname}
                          content={replyContent}
                          onContentChange={setReplyContent}
                          submitting={replySubmitting}
                          error={replyError}
                          onCancel={() => setReplyTargetId("")}
                          onSubmit={() => void submitReply()}
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
