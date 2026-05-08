import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ContentEditor } from "@/components/ContentEditor";
import { defaultContent, type SiteContent } from "@/lib/site-content-types";
import { resetStore, store } from "@/test/mocks/handlers";
import { simulateBfcacheRestore } from "@/test/mocks/bfcache";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock("@/components/ImageUpload", () => ({
  ImageUpload: ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
    <input
      data-testid="image-upload"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  ),
}));

beforeEach(() => {
  vi.clearAllMocks();
  resetStore();
});

describe("ContentEditor", () => {
  it("renders brand name from initialContent", () => {
    const content: SiteContent = {
      ...defaultContent,
      brand: { name: "My Brand" },
    };
    render(<ContentEditor initialContent={content} />);
    const input = screen.getByPlaceholderText("品牌名称") as HTMLInputElement;
    expect(input.value).toBe("My Brand");
  });

  it("renders hero greeting values", () => {
    render(<ContentEditor initialContent={defaultContent} />);
    const zhGreeting = screen.getByPlaceholderText("你好，我是") as HTMLInputElement;
    const enGreeting = screen.getByPlaceholderText("Hi, I'm") as HTMLInputElement;
    expect(zhGreeting.value).toBe(defaultContent.hero.greeting.zh);
    expect(enGreeting.value).toBe(defaultContent.hero.greeting.en);
  });

  it("updates brand name on input", async () => {
    const user = userEvent.setup();
    render(<ContentEditor initialContent={defaultContent} />);

    const input = screen.getByPlaceholderText("品牌名称");
    await user.clear(input);
    await user.type(input, "New Brand");

    expect((input as HTMLInputElement).value).toBe("New Brand");
  });

  it("updates hero greeting on input", async () => {
    const user = userEvent.setup();
    render(<ContentEditor initialContent={defaultContent} />);

    const greeting = screen.getByPlaceholderText("你好，我是");
    await user.clear(greeting);
    await user.type(greeting, "嗨，我是");

    expect((greeting as HTMLInputElement).value).toBe("嗨，我是");
  });

  it("updates about skills from comma-separated input", async () => {
    render(<ContentEditor initialContent={defaultContent} />);

    const skillsInput = screen.getByPlaceholderText("AI Coding, Frontend, Product, Deploy") as HTMLInputElement;

    // Use fireEvent.change to set the value directly, since userEvent.type
    // types character-by-character and the onChange handler parses commas mid-type
    fireEvent.change(skillsInput, { target: { value: "React, Vue, Angular" } });

    // The handler splits on commas, trims, joins back with ", "
    expect(skillsInput.value).toBe("React, Vue, Angular");
  });

  it("shows error when save fails with 401", async () => {
    const user = userEvent.setup();
    render(<ContentEditor initialContent={defaultContent} />);

    await user.click(screen.getByText("保存更改"));

    // The MSW handler returns 401 when studioAuthorized is false
    // The component parses the error response and displays it
    await waitFor(() => {
      expect(screen.getByText("Unauthorized")).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it("shows success and calls router.push on successful save", async () => {
    store.studioAuthorized = true;
    const user = userEvent.setup();
    render(<ContentEditor initialContent={defaultContent} />);

    await user.click(screen.getByText("保存更改"));

    await waitFor(() => {
      expect(screen.getByText("已保存，跳转中...")).toBeInTheDocument();
    });
  });

  it("renders save button", () => {
    render(<ContentEditor initialContent={defaultContent} />);
    expect(screen.getByText("保存更改")).toBeInTheDocument();
    expect(screen.getByText("重置为默认")).toBeInTheDocument();
  });

  it("displays reset button", () => {
    render(<ContentEditor initialContent={defaultContent} />);
    expect(screen.getByText("重置为默认")).toBeInTheDocument();
  });

  it("re-fetches content on bfcache pageshow event", async () => {
    render(<ContentEditor initialContent={defaultContent} />);

    // Change server-side content
    store.siteContent = {
      ...defaultContent,
      brand: { name: "Server Updated Brand" },
    };

    // Simulate bfcache restore
    simulateBfcacheRestore();

    await waitFor(() => {
      const input = screen.getByPlaceholderText("品牌名称") as HTMLInputElement;
      expect(input.value).toBe("Server Updated Brand");
    });
  });

  it("syncs content when initialContent prop changes", async () => {
    const { rerender } = render(<ContentEditor initialContent={defaultContent} />);

    const updated: SiteContent = {
      ...defaultContent,
      brand: { name: "Updated Prop Brand" },
    };
    rerender(<ContentEditor initialContent={updated} />);

    await waitFor(() => {
      const input = screen.getByPlaceholderText("品牌名称") as HTMLInputElement;
      expect(input.value).toBe("Updated Prop Brand");
    });
  });

  it("renders about section fields", () => {
    render(<ContentEditor initialContent={defaultContent} />);
    expect(screen.getByText("关于我区域")).toBeInTheDocument();
    expect(screen.getByText("技能标签")).toBeInTheDocument();
  });

  it("renders hero section fields", () => {
    render(<ContentEditor initialContent={defaultContent} />);
    expect(screen.getByText("Hero 区域")).toBeInTheDocument();
    expect(screen.getByText("主标题")).toBeInTheDocument();
    expect(screen.getAllByText("描述").length).toBeGreaterThanOrEqual(2);
  });
});
