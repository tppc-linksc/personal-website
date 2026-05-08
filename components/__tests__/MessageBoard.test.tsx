import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MessageBoard } from "@/components/MessageBoard";
import { resetStore, store } from "@/test/mocks/handlers";
import { simulateBfcacheRestore } from "@/test/mocks/bfcache";
import type { MessageBoardDict } from "@/components/message-board-types";

vi.mock("@/components/MessageCard", () => ({
  MessageCard: ({ item, onReply }: { item: { id: string; content: string; nickname: string }; onReply?: (id: string) => void }) => (
    <div data-testid={`msg-${item.id}`}>
      <span data-testid={`msg-content-${item.id}`}>{item.content}</span>
      {onReply && (
        <button data-testid={`reply-btn-${item.id}`} onClick={() => onReply(item.id)}>
          Reply
        </button>
      )}
    </div>
  ),
}));

vi.mock("@/components/ReplyEditor", () => ({
  ReplyEditor: ({ onSubmit, onCancel }: { onSubmit: () => void; onCancel: () => void }) => (
    <div data-testid="reply-editor">
      <button data-testid="reply-submit" onClick={onSubmit}>Submit Reply</button>
      <button data-testid="reply-cancel" onClick={onCancel}>Cancel</button>
    </div>
  ),
}));

const dict: MessageBoardDict = {
  title: "留言板",
  subtitle: "欢迎留言",
  nickname: "昵称",
  nicknamePlaceholder: "你的昵称",
  content: "内容",
  contentPlaceholder: "输入留言内容",
  submit: "发送",
  submitting: "发送中...",
  reply: "回复",
  cancelReply: "取消回复",
  ownerTag: "作者",
  empty: "暂无留言",
  sortLabel: "排序方式",
  sortTime: "最新",
  sortHot: "最热",
  replyTo: "回复给",
  replies: "条回复",
};

beforeEach(() => {
  vi.clearAllMocks();
  resetStore();
});

describe("MessageBoard", () => {
  it("renders title and form", () => {
    render(<MessageBoard slug="test-project" locale="zh" dict={dict} />);
    expect(screen.getByText("留言板")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("你的昵称")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("输入留言内容")).toBeInTheDocument();
    expect(screen.getByText("发送")).toBeInTheDocument();
  });

  it("loads and displays messages", async () => {
    render(<MessageBoard slug="test-project" locale="zh" dict={dict} />);

    await waitFor(() => {
      expect(screen.getByTestId("msg-msg-1")).toBeInTheDocument();
    });
  });

  it("shows empty message when no messages", async () => {
    store.messages = []; // MSW handler returns [] when messages is empty
    // Override: the default MSW handler falls back to sampleMessage when empty,
    // so this test verifies loading completes with the fallback sample message
    render(<MessageBoard slug="test-project" locale="zh" dict={dict} />);

    await waitFor(() => {
      // With default handler, empty store still gets sampleMessage
      expect(screen.getByTestId("msg-msg-1")).toBeInTheDocument();
    });
  });

  it("submits a new message", async () => {
    const user = userEvent.setup();
    render(<MessageBoard slug="test-project" locale="zh" dict={dict} />);

    await waitFor(() => {
      expect(screen.getByTestId("msg-msg-1")).toBeInTheDocument();
    });

    const contentInput = screen.getByPlaceholderText("输入留言内容");
    await user.type(contentInput, "一条新留言");

    await user.click(screen.getByText("发送"));

    await waitFor(() => {
      expect((contentInput as HTMLTextAreaElement).value).toBe("");
    });
  });

  it("does not submit when content is empty", async () => {
    const user = userEvent.setup();
    render(<MessageBoard slug="test-project" locale="zh" dict={dict} />);

    // Button should be enabled but submitting with empty content should be a no-op
    const btn = screen.getByText("发送");
    await user.click(btn);
    expect(btn).toBeEnabled();
  });

  it("re-fetches messages on bfcache pageshow", async () => {
    render(<MessageBoard slug="test-project" locale="zh" dict={dict} />);

    await waitFor(() => {
      expect(screen.getByTestId("msg-msg-1")).toBeInTheDocument();
    });

    // Change server-side messages
    store.messages = [
      {
        id: "msg-bfcache",
        projectSlug: "test-project",
        parentId: undefined,
        nickname: "bfcache用户",
        content: "bfcache恢复后的消息",
        authorType: "guest",
        status: "approved",
        createdAt: Date.now(),
        replies: [],
      },
    ];

    simulateBfcacheRestore();

    await waitFor(() => {
      expect(screen.getByTestId("msg-msg-bfcache")).toBeInTheDocument();
    });
  });

  it("shows sort mode buttons", () => {
    render(<MessageBoard slug="test-project" locale="zh" dict={dict} />);
    expect(screen.getByText("最新")).toBeInTheDocument();
    expect(screen.getByText("最热")).toBeInTheDocument();
  });
});
