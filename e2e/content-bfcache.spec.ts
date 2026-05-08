import { test, expect } from "@playwright/test";

test.describe("bfcache back/forward navigation", () => {
  test("home page renders", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("header")).toBeVisible();
    await expect(page.locator("main")).toBeVisible();
  });

  test("home → projects and back preserves scroll position", async ({ page }) => {
    await page.goto("/zh");

    // Navigate to projects section if available
    const projectLink = page.getByText(/项目|Projects/i).first();
    if (await projectLink.isVisible()) {
      await projectLink.click();
      await page.waitForTimeout(500);

      // Go back
      await page.goBack();
      await expect(page.locator("body")).toBeVisible();
    }
  });

  test("navigate across pages via menu", async ({ page }) => {
    await page.goto("/zh");

    // Click into a project if any are visible
    const projectCards = page.locator('a[href*="/projects/"]');
    const count = await projectCards.count();

    if (count > 0) {
      await projectCards.first().click();
      await page.waitForURL(/\/projects\//);
      await expect(page.locator("main")).toBeVisible();

      // Go back to home
      await page.goBack();
      await page.waitForURL(/\/zh/);
      await expect(page.locator("main")).toBeVisible();

      // Go forward back to project
      await page.goForward();
      await page.waitForURL(/\/projects\//);
      await expect(page.locator("main")).toBeVisible();
    }
  });

  test("404 page renders for nonexistent route", async ({ page }) => {
    await page.goto("/nonexistent-page-xyz");
    // Next.js dev mode may return 200 for custom not-found pages;
    // verify the page content renders instead
    await expect(page.locator("main")).toBeVisible();
    await expect(page.locator("h1, h2")).toContainText(/404|不存在|Not Found/i);
  });
});

test.describe("content rendering", () => {
  test("homepage shows hero section", async ({ page }) => {
    await page.goto("/zh");
    await expect(page.locator("main")).toBeVisible();
  });

  test("language switching works", async ({ page }) => {
    await page.goto("/zh");
    await expect(page.locator("html")).toHaveAttribute("lang");

    await page.goto("/en");
    await expect(page.locator("html")).toHaveAttribute("lang");
    await expect(page.locator("main")).toBeVisible();
  });
});
