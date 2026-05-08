import { describe, it, expect } from "vitest";
import { formatTime } from "../format-time";

describe("formatTime", () => {
  const ts = 1700000000000;

  it("returns zh-CN formatted string for zh locale", () => {
    const result = formatTime(ts, "zh");
    expect(result).toContain("2023");
  });

  it("returns en-US formatted string for en locale", () => {
    const result = formatTime(ts, "en");
    expect(result).toContain("2023");
  });

  it("returns different format for different locales", () => {
    const zh = formatTime(ts, "zh");
    const en = formatTime(ts, "en");
    expect(zh).not.toBe(en);
  });

  it("handles epoch timestamp", () => {
    const result = formatTime(0, "zh");
    expect(result).toContain("1970");
  });

  it("handles future timestamp", () => {
    const result = formatTime(2000000000000, "zh");
    expect(result).toContain("2033");
  });
});
