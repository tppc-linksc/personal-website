import { buildMessageTree, normalizeParentId, type MessageItem, type MessageNode, type MessageStatus } from "@/lib/messages";
import {
  createMessageInCloudbase,
  listMessagesFromCloudbase,
  updateMessageStatusInCloudbase,
  usingCloudbaseMessages,
} from "@/lib/cloudbase-messages";

const localMessages: MessageItem[] = [];

function clone(items: MessageItem[]): MessageItem[] {
  return items.map((item) => ({ ...item }));
}

export async function getMessagesByProject(projectSlug: string, options?: { includeHidden?: boolean }): Promise<MessageItem[]> {
  const includeHidden = Boolean(options?.includeHidden);

  try {
    const cloud = await listMessagesFromCloudbase(projectSlug);
    if (cloud) {
      return includeHidden ? cloud : cloud.filter((item) => item.status === "approved");
    }
  } catch (error) {
    console.error("[messages-source] list cloudbase failed", error);
  }

  const local = clone(localMessages.filter((item) => item.projectSlug === projectSlug));
  return includeHidden ? local : local.filter((item) => item.status === "approved");
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

  if (usingCloudbaseMessages()) {
    await createMessageInCloudbase(message);
  } else {
    localMessages.push(message);
  }

  return message;
}

export async function moderateMessage(id: string, status: MessageStatus): Promise<void> {
  if (usingCloudbaseMessages()) {
    await updateMessageStatusInCloudbase(id, status);
    return;
  }

  const index = localMessages.findIndex((item) => item.id === id);
  if (index >= 0) {
    localMessages[index] = { ...localMessages[index], status };
  }
}
