import { describe, it, expect } from "vitest";
import { isLocale, getDictionary } from "../i18n";

describe("isLocale", () => {
  it("returns true for zh", () => {
    expect(isLocale("zh")).toBe(true);
  });

  it("returns true for en", () => {
    expect(isLocale("en")).toBe(true);
  });

  it("returns false for fr", () => {
    expect(isLocale("fr")).toBe(false);
  });

  it("returns false for empty string", () => {
    expect(isLocale("")).toBe(false);
  });
});

describe("getDictionary", () => {
  it("returns zh dictionary", () => {
    const dict = getDictionary("zh");
    expect(dict.meta.title).toBeTruthy();
    expect(dict.nav.about).toBeTruthy();
  });

  it("returns en dictionary", () => {
    const dict = getDictionary("en");
    expect(dict.meta.title).toBeTruthy();
    expect(dict.nav.about).toBeTruthy();
  });

  it("returns a deep clone (mutation does not affect source)", () => {
    const dict1 = getDictionary("zh");
    const dict2 = getDictionary("zh");
    dict1.meta.title = "modified";
    expect(dict2.meta.title).not.toBe("modified");
  });
});
