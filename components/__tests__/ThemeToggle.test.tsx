import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeToggle } from "@/components/ThemeToggle";

beforeEach(() => {
  vi.clearAllMocks();
  window.localStorage.clear();
  delete document.documentElement.dataset.theme;
});

describe("ThemeToggle", () => {
  it("renders toggle button with aria-label", () => {
    render(<ThemeToggle />);
    expect(screen.getByLabelText("Toggle color theme")).toBeInTheDocument();
  });

  it("toggles from light to dark on click", async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);

    await user.click(screen.getByLabelText("Toggle color theme"));

    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(window.localStorage.getItem("portfolio-theme")).toBe("dark");
  });

  it("toggles from dark back to light", async () => {
    const user = userEvent.setup();
    window.localStorage.setItem("portfolio-theme", "dark");
    render(<ThemeToggle />);

    await user.click(screen.getByLabelText("Toggle color theme"));

    expect(document.documentElement.dataset.theme).toBe("light");
    expect(window.localStorage.getItem("portfolio-theme")).toBe("light");
  });

  it("reads initial theme from localStorage", () => {
    window.localStorage.setItem("portfolio-theme", "dark");
    render(<ThemeToggle />);
    expect(document.documentElement.dataset.theme).toBe("dark");
  });

  it("defaults to light when no stored theme", () => {
    render(<ThemeToggle />);
    expect(document.documentElement.dataset.theme).toBe("light");
  });
});
