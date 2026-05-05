import type { MessageAuthorType, MessageItem, MessageStatus } from "@/lib/messages";
import { isCloudbaseConfigured, getCloudbaseDb, isCollectionMissingError } from "@/lib/cloudbase";

const COLLECTION = process.env.CLOUDBASE_MESSAGES_COLLECTION ?? "project_messages";
const getDb = getCloudbaseDb;
const isConfigured = isCloudbaseConfigured;

function toAuthorType(value: unknown): MessageAuthorType {
  return value === "owner" ? "owner" : "guest";
}

function toStatus(value: unknown): MessageStatus {
  return value === "hidden" ? "hidden" : "approved";
}

function normalizeMessage(value: unknown): MessageItem | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as Record<string, unknown>;
  const id = typeof record.id === "string" ? record.id.trim() : "";
  const projectSlug = typeof record.projectSlug === "string" ? record.projectSlug.trim() : "";
  const nickname = typeof record.nickname === "string" ? record.nickname.trim() : "";
  const content = typeof record.content === "string" ? record.content.trim() : "";

  if (!id || !projectSlug || !nickname || !content) {
    return null;
  }

  return {
    id,
    projectSlug,
    parentId: typeof record.parentId === "string" && record.parentId.trim() ? record.parentId.trim() : undefined,
    authorType: toAuthorType(record.authorType),
    nickname,
    content,
    status: toStatus(record.status),
    createdAt: typeof record.createdAt === "number" ? record.createdAt : Date.now(),
  };
}

export async function listMessagesFromCloudbase(projectSlug: string): Promise<MessageItem[] | null> {
  if (!isConfigured()) {
    return null;
  }

  try {
    const db = getDb();
    const result = await db.collection(COLLECTION).where({ projectSlug }).limit(1000).get();
    return result.data
      .map(normalizeMessage)
      .filter((item): item is MessageItem => item !== null)
      .sort((a, b) => a.createdAt - b.createdAt);
  } catch (error) {
    if (isCollectionMissingError(error)) {
      return [];
    }
    throw error;
  }
}

export async function createMessageInCloudbase(message: MessageItem): Promise<void> {
  try {
    const db = getDb();
    await db.collection(COLLECTION).doc(message.id).set(message);
  } catch (error) {
    if (isCollectionMissingError(error)) {
      throw new Error(`CloudBase collection '${COLLECTION}' not found`);
    }
    throw error;
  }
}

export async function updateMessageStatusInCloudbase(id: string, status: MessageStatus): Promise<void> {
  try {
    const db = getDb();
    const result = await db.collection(COLLECTION).doc(id).get();
    const row = result.data?.[0];
    const message = normalizeMessage(row);
    if (!message) {
      throw new Error("Message not found");
    }

    await db.collection(COLLECTION).doc(id).set({
      ...message,
      status,
    });
  } catch (error) {
    if (isCollectionMissingError(error)) {
      throw new Error(`CloudBase collection '${COLLECTION}' not found`);
    }
    throw error;
  }
}

export function usingCloudbaseMessages(): boolean {
  return isConfigured();
}
