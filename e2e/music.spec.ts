import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("music section renders grouped categories", async ({ page }) => {
  const section = page.getByTestId("music-section");
  await expect(section).toBeVisible();
  await expect(section.getByRole("heading", { name: "華語流行" })).toBeVisible();
  await expect(section.getByRole("heading", { name: "西方搖滾" })).toBeVisible();
  await expect(section.getByRole("heading", { name: "電子Hip-Hop" })).toBeVisible();
  await expect(section.getByRole("heading", { name: "參考資料" })).toBeVisible();
  await expect(page.getByTestId("music-item-青花瓷-100d18")).toBeVisible();
});

test("detail popup shows bodyMd and 未完 note", async ({ page }) => {
  await page.getByTestId("music-item-青花瓷-100d18").click();
  const popup = page.getByTestId("music-popup");
  await expect(popup).toBeVisible();
  await expect(popup.getByText("天青色等煙雨")).toBeVisible();
  await expect(popup.getByText("（未完）")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(popup).toBeHidden();
});

test("recommender keyboard flow shows picks, Esc closes and focus returns", async ({ page }) => {
  await page.route("**/api/recommend", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        picks: [{ slug: "青花瓷-100d18", title: "青花瓷", category: "華語流行", reason: "啱你心情" }],
      }),
    });
  });
  const input = page.getByTestId("recommender-input");
  await expect(input).toBeVisible();
  await input.focus();
  await input.fill("開心");
  await page.keyboard.press("Enter");
  const dialog = page.getByTestId("recommend-dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText("青花瓷")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(input).toBeFocused();
});

test("recommender mocked states show friendly messages", async ({ page }) => {
  const input = page.getByTestId("recommender-input");
  const submit = page.getByTestId("recommender-submit");
  const dialog = page.getByTestId("recommend-dialog");

  await page.route("**/api/recommend", async (route) => {
    await new Promise((r) => setTimeout(r, 500));
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        picks: [{ slug: "x", title: "X", category: "華語流行", reason: "r" }],
      }),
    });
  });
  await input.fill("test loading");
  await submit.click();
  await expect(dialog.getByText("諗緊")).toBeVisible();
  await expect(dialog.getByText("X")).toBeVisible({ timeout: 8000 });
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();

  await page.unroute("**/api/recommend");
  await page.route("**/api/recommend", async (route) => {
    await route.fulfill({
      status: 429,
      contentType: "application/json",
      body: JSON.stringify({ ok: false, error: "rate_limited", message: "今日撳得太多" }),
    });
  });
  await input.fill("again");
  await submit.click();
  await expect(dialog.getByText("太多")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();

  await page.unroute("**/api/recommend");
  await page.route("**/api/recommend", async (route) => {
    await route.fulfill({
      status: 503,
      contentType: "application/json",
      body: JSON.stringify({ ok: false, error: "budget_exhausted", message: "額度用晒" }),
    });
  });
  await input.fill("again2");
  await submit.click();
  await expect(dialog.getByText("額度用晒")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();

  await page.unroute("**/api/recommend");
  await page.route("**/api/recommend", async (route) => {
    await route.fulfill({
      status: 502,
      contentType: "application/json",
      body: JSON.stringify({ ok: false, error: "gateway_error", message: "暫時用唔到" }),
    });
  });
  await input.fill("again3");
  await submit.click();
  await expect(dialog.getByText("暫時用唔到")).toBeVisible();
});

test("recommender sits at bottom with label and counter", async ({ page }) => {
  const form = page.getByTestId("recommender-form");
  await expect(form).toBeVisible();
  await expect(page.getByTestId("recommender-input")).toHaveAttribute("maxlength", "300");
  await page.getByTestId("recommender-input").fill("hi");
  await expect(page.getByTestId("recommender-count")).toContainText("2");
});
