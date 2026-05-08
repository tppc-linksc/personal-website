import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { VisitCounter } from "@/components/VisitCounter";
import { resetStore, store } from "@/test/mocks/handlers";
import { simulateBfcacheRestore } from "@/test/mocks/bfcache";

beforeEach(() => {
  vi.clearAllMocks();
  resetStore();
  window.sessionStorage.clear();
});

describe("VisitCounter", () => {
  it("shows hidden placeholder while loading", () => {
    render(<VisitCounter locale="zh" />);
    const span = screen.getByText("-");
    expect(span).toBeInTheDocument();
    expect(span).toHaveAttribute("aria-hidden", "true");
  });

  it("displays visit count after load", async () => {
    render(<VisitCounter locale="zh" />);

    await waitFor(() => {
      expect(screen.getByText(/已被访问/)).toBeInTheDocument();
    });
  });

  it("renders in inline variant", async () => {
    render(<VisitCounter locale="zh" variant="inline" />);

    await waitFor(() => {
      const el = screen.getByText(/已被访问/);
      expect(el.tagName).toBe("SPAN");
    });
  });

  it("renders in en locale", async () => {
    render(<VisitCounter locale="en" />);

    await waitFor(() => {
      expect(screen.getByText(/visits/)).toBeInTheDocument();
    });
  });

  it("re-syncs visits on bfcache pageshow", async () => {
    render(<VisitCounter locale="zh" />);

    // Initial load: POST increments 42 → 43
    await waitFor(() => {
      expect(screen.getByText("已被访问 43 次")).toBeInTheDocument();
    });

    // Change visit count on server
    store.visits = 99;

    simulateBfcacheRestore();

    // After bfcache restore, GET returns 99 (no increment since sessionStorage is set)
    await waitFor(() => {
      expect(screen.getByText("已被访问 99 次")).toBeInTheDocument();
    });
  });
});
