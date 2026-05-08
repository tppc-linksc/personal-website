import { describe, it, expect } from "vitest";
import { normalizeParentId, buildMessageTree } from "../messages";
import type { MessageItem } from "../messages";

describe("normalizeParentId", () => {
  it("returns trimmed string for non-empty input", () => {
    expect(normalizeParentId("  abc  ")).toBe("abc");
  });

  it("returns undefined for null", () => {
    expect(normalizeParentId(null)).toBeUndefined();
  });

  it("returns undefined for undefined", () => {
    expect(normalizeParentId(undefined)).toBeUndefined();
  });

  it("returns undefined for whitespace-only string", () => {
    expect(normalizeParentId("   ")).toBeUndefined();
  });
});

describe("buildMessageTree", () => {
  const makeMsg = (id: string, parentId?: string, createdAt = 0): MessageItem => ({
    id,
    projectSlug: "test",
    parentId,
    nickname: "user",
    content: `Message ${id}`,
    authorType: "guest",
    status: "approved",
    createdAt,
  });

  it("returns empty array for empty input", () => {
    expect(buildMessageTree([])).toEqual([]);
  });

  it("returns single root node with empty replies", () => {
    const tree = buildMessageTree([makeMsg("1")]);
    expect(tree).toHaveLength(1);
    expect(tree[0].id).toBe("1");
    expect(tree[0].replies).toEqual([]);
  });

  it("sorts root messages by createdAt", () => {
    const tree = buildMessageTree([
      makeMsg("2", undefined, 200),
      makeMsg("1", undefined, 100),
    ]);
    expect(tree[0].id).toBe("1");
    expect(tree[1].id).toBe("2");
  });

  it("attaches reply to parent", () => {
    const tree = buildMessageTree([
      makeMsg("1", undefined, 100),
      makeMsg("2", "1", 200),
    ]);
    expect(tree).toHaveLength(1);
    expect(tree[0].replies).toHaveLength(1);
    expect(tree[0].replies[0].id).toBe("2");
  });

  it("handles nested replies", () => {
    const tree = buildMessageTree([
      makeMsg("1", undefined, 100),
      makeMsg("2", "1", 200),
      makeMsg("3", "2", 300),
    ]);
    expect(tree[0].replies[0].replies[0].id).toBe("3");
  });

  it("promotes orphan to root when parentId not found", () => {
    const tree = buildMessageTree([
      makeMsg("2", "nonexistent", 200),
    ]);
    expect(tree).toHaveLength(1);
    expect(tree[0].id).toBe("2");
  });

  it("handles mixed roots and replies", () => {
    const tree = buildMessageTree([
      makeMsg("1", undefined, 100),
      makeMsg("2", undefined, 200),
      makeMsg("3", "1", 300),
    ]);
    expect(tree).toHaveLength(2);
    expect(tree[0].replies).toHaveLength(1);
    expect(tree[1].replies).toHaveLength(0);
  });
});
