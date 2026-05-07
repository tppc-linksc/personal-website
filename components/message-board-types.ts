import type { Locale } from "@/lib/i18n";
import type { MessageNode } from "@/lib/messages";

export interface MessageBoardDict {
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

export interface MessageCardProps {
  item: MessageNode;
  locale: Locale;
  dict: MessageBoardDict;
  replyTo?: string;
  onReply: (targetId: string) => void;
}

export interface ReplyEditorProps {
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
}

export function formatTime(ts: number, locale: Locale): string {
  return new Date(ts).toLocaleString(locale === "zh" ? "zh-CN" : "en-US", {
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
