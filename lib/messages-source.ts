import { readFileSync, writeFileSync, existsSync, mkdirSync, renameSync } from "fs";
import { join } from "path";
import { buildMessageTree, normalizeParentId, type MessageItem, type MessageNode, type MessageStatus } from "@/lib/messages";

const DATA_FILE = join(process.cwd(), "data", "messages.json");

function ensureDataDir(): void {
  const dir = join(process.cwd(), "data");
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

function loadMessages(): MessageItem[] {
  try {
    if (existsSync(DATA_FILE)) {
      return JSON.parse(readFileSync(DATA_FILE, "utf-8")) as MessageItem[];
    }
  } catch { /* ignore */ }
  return [];
}

function saveMessages(messages: MessageItem[]): void {
  ensureDataDir();
  const tempFile = `${DATA_FILE}.tmp`;
  writeFileSync(tempFile, JSON.stringify(messages, null, 2), "utf-8");
  renameSync(tempFile, DATA_FILE);
}

export async function getMessagesByProject(projectSlug: string, options?: { includeHidden?: boolean }): Promise<MessageItem[]> {
  const includeHidden = Boolean(options?.includeHidden);
  const rows = loadMessages().filter((item) => item.projectSlug === projectSlug);
  return includeHidden ? rows : rows.filter((item) => item.status === "approved");
}

export async function getMessageTreeByProject(projectSlug: string): Promise<MessageNode[]> {
  const rows = await getMessagesByProject(projectSlug);
  return buildMessageTree(rows);
}

export async function getMessageById(projectSlug: string, id: string): Promise<MessageItem | undefined> {
  const rows = await getMessagesByProject(projectSlug, { includeHidden: true });
  return rows.find((item) => item.id === id);
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
  const messages = loadMessages();

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

  messages.push(message);
  saveMessages(messages);

  return message;
}

export async function moderateMessage(id: string, status: MessageStatus): Promise<void> {
  const messages = loadMessages();
  const index = messages.findIndex((item) => item.id === id);
  if (index >= 0) {
    messages[index] = { ...messages[index], status };
    saveMessages(messages);
  }
}
