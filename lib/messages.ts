export type MessageAuthorType = "guest" | "owner";
export type MessageStatus = "approved" | "hidden";

export interface MessageItem {
  id: string;
  projectSlug: string;
  parentId?: string;
  authorType: MessageAuthorType;
  nickname: string;
  content: string;
  status: MessageStatus;
  createdAt: number;
}

export interface MessageNode extends MessageItem {
  replies: MessageNode[];
}

export function normalizeParentId(value: string | null | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

export function buildMessageTree(items: MessageItem[]): MessageNode[] {
  const sorted = [...items].sort((a, b) => a.createdAt - b.createdAt);
  const nodeMap = new Map<string, MessageNode>();

  for (const item of sorted) {
    nodeMap.set(item.id, { ...item, replies: [] });
  }

  const roots: MessageNode[] = [];
  for (const item of sorted) {
    const node = nodeMap.get(item.id);
    if (!node) {
      continue;
    }

    if (item.parentId && nodeMap.has(item.parentId)) {
      nodeMap.get(item.parentId)?.replies.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}
