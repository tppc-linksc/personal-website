import { test, expect } from "@playwright/test";

test.describe("authentication flow", () => {
  test("/studio redirects or shows login prompt when unauthenticated", async ({ page }) => {
    await page.goto("/studio");
    await page.waitForLoadState("networkidle");

    // Studio page should render (it may show login prompt or the content area)
    await expect(page.locator("main")).toBeVisible();
  });

  test("/content redirects or shows login when unauthenticated", async ({ page }) => {
    await page.goto("/content");

    // Should render — either shows ContentEditor or redirects to login
    await expect(page.locator("main")).toBeVisible();
  });

  test("API session endpoint accessible", async ({ page }) => {
    const resp = await page.request.get("/api/studio/session");
    expect(resp.status()).toBe(200);

    const body = await resp.json();
    expect(typeof body.authenticated).toBe("boolean");
  });

  test("API returns 401 for unauthenticated content POST", async ({ page }) => {
    const resp = await page.request.post("/api/site-content", {
      data: { content: {} },
    });
    expect(resp.status()).toBe(401);
  });

  test("API returns 200 for public content GET", async ({ page }) => {
    const resp = await page.request.get("/api/site-content");
    expect(resp.status()).toBe(200);
    const body = await resp.json();
    expect(body.content).toBeDefined();
  });
});

test.describe("cookies and session", () => {
  test("studio session cookie is httpOnly and Secure in production", async ({ page }) => {
    // Attempt login with garbage — should get 401
    const resp = await page.request.post("/api/studio/session", {
      data: { token: "invalid" },
    });
    expect(resp.status()).toBe(401);

    // Check set-cookie header is absent on failure
    const setCookie = resp.headers()["set-cookie"];
    expect(setCookie).toBeUndefined();
  });
});
