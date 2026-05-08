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

