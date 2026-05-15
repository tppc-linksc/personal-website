import "server-only";

import db from "@/lib/db";
import { buildMessageTree, normalizeParentId, type MessageItem, type MessageNode, type MessageStatus } from "@/lib/messages";

function rowToMessage(row: Record<string, unknown>): MessageItem {
  return {
    id: row.id as string,
    projectSlug: row.project_slug as string,
    parentId: (row.parent_id as string) || undefined,
    authorType: row.author_type as "guest" | "owner",
    nickname: row.nickname as string,
    content: row.content as string,
    status: row.status as MessageStatus,
    createdAt: row.created_at as number,
  };
}

export async function getMessagesByProject(projectSlug: string, options?: { includeHidden?: boolean }): Promise<MessageItem[]> {
  const includeHidden = Boolean(options?.includeHidden);
  const sql = includeHidden
    ? `SELECT * FROM messages WHERE project_slug = ? ORDER BY created_at ASC`
    : `SELECT * FROM messages WHERE project_slug = ? AND status = 'approved' ORDER BY created_at ASC`;
  const rows = db.prepare(sql).all(projectSlug) as Array<Record<string, unknown>>;
  return rows.map(rowToMessage);
}

export async function getMessageTreeByProject(projectSlug: string): Promise<MessageNode[]> {
  const rows = await getMessagesByProject(projectSlug);
  return buildMessageTree(rows);
}

export async function getMessageById(projectSlug: string, id: string): Promise<MessageItem | undefined> {
  const row = db.prepare(`SELECT * FROM messages WHERE project_slug = ? AND id = ?`).get(projectSlug, id) as Record<string, unknown> | undefined;
  return row ? rowToMessage(row) : undefined;
}

export async function createMessage(input: {
  id: string;
  projectSlug: string;
  parentId?: string;
  authorType: "guest" | "owner";
  nickname: string;
  content: string;
  status?: MessageStatus;
}): Promise<MessageItem> {
  const message: MessageItem = {
    id: input.id,
    projectSlug: input.projectSlug,
    parentId: normalizeParentId(input.parentId),
    authorType: input.authorType,
    nickname: input.nickname,
    content: input.content,
    status: input.status ?? "approved",
    createdAt: Date.now(),
  };

  db.prepare(`
    INSERT INTO messages (id, project_slug, parent_id, author_type, nickname, content, status, created_at)
    VALUES (@id, @projectSlug, @parentId, @authorType, @nickname, @content, @status, @createdAt)
  `).run({
    id: message.id,
    projectSlug: message.projectSlug,
    parentId: message.parentId ?? null,
    authorType: message.authorType,
    nickname: message.nickname,
    content: message.content,
    status: message.status,
    createdAt: message.createdAt,
  });

  return message;
}

export async function moderateMessage(id: string, status: MessageStatus): Promise<void> {
  db.prepare(`UPDATE messages SET status = ? WHERE id = ?`).run(status, id);
}
