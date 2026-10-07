import { expect, test } from "@playwright/test";
import entries from "./fixtures/entries.json";

/**
 * KPP-3 RED: hide the music catalog, keep the recommender.
 * These tests must FAIL on main (catalog visible) and PASS after GREEN.
 */

test("catalog hidden: no music-section heading or category labels (zh and en)", async ({
  page,
}) => {
  await page.goto("/");
  // zh default
  await expect(page.getByTestId("music-section")).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "音樂角落" })).toHaveCount(0);
  for (const label of ["華語流行", "西方搖滾", "電子Hip-Hop", "參考資料", "分冊目錄"]) {
    await expect(page.getByText(label, { exact: false })).toHaveCount(0);
  }

  // switch to en and check again
  await page.getByTestId("lang-toggle").click();
  await expect(page.getByRole("heading", { name: /Pixel Park/ })).toBeVisible();
  await expect(page.getByTestId("music-section")).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "音樂角落" })).toHaveCount(0);
  for (const label of ["華語流行", "西方搖滾", "電子Hip-Hop", "參考資料", "分冊目錄"]) {
    await expect(page.getByText(label, { exact: false })).toHaveCount(0);
  }
});

test("home html and scripts leak no catalog text", async ({ page, request }) => {
  const res = await request.get("/");
  expect(res.ok()).toBeTruthy();
  const html = await res.text();

  // Collect every same-origin script the page loads.
  const srcs = new Set<string>();
  for (const m of html.matchAll(/src="([^"]+\.js[^"]*)"/g)) {
    const src = m[1];
    if (src.startsWith("/") || src.startsWith("./") || !src.includes("://")) {
      srcs.add(src);
    }
  }
  // Also include scripts observed by the browser (covers hashed chunks).
  await page.goto("/");
  for (const s of await page.evaluate(() =>
    Array.from(document.querySelectorAll("script[src]")).map((el) =>
      (el as HTMLScriptElement).getAttribute("src"),
    ),
  )) {
    if (s && (s.startsWith("/") || !s.includes("://"))) srcs.add(s);
  }

  let blob = html;
  for (const src of srcs) {
    const url = src.startsWith("http") ? src : src.startsWith("/") ? src : `/${src}`;
    const r = await request.get(url);
    if (r.ok()) blob += "\n" + (await r.text());
  }

  const titles = (entries as Array<{ title: string }>).map((e) => e.title);
  const bodies = (entries as Array<{ bodyMd: string | null }>)
    .map((e) => e.bodyMd)
    .filter((b): b is string => typeof b === "string" && b.length > 0);
  for (const t of titles) {
    expect(blob, `leaked title ${t}`).not.toContain(t);
  }
  for (const b of bodies) {
    // Check a distinctive slice so formatting differences cannot hide a leak.
    const slice = b.slice(0, 12);
    expect(blob, `leaked bodyMd slice ${slice}`).not.toContain(slice);
  }
  expect(blob).not.toContain("bodyMd");
  expect(blob).not.toContain("lyrics");
});

test("recommender shows title+reason only, no links/category/bodyMd, Esc closes and focus returns", async ({
  page,
}) => {
  await page.route("**/api/recommend", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        picks: [{ slug: "測試歌甲-100d18", title: "測試歌甲", category: "華語流行", reason: "啱你心情" }],
      }),
    });
  });
  await page.goto("/");
  const input = page.getByTestId("recommender-input");
  await expect(input).toBeVisible();
  await input.focus();
  await input.fill("開心");
  await page.keyboard.press("Enter");
  const dialog = page.getByTestId("recommend-dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText("測試歌甲")).toBeVisible();
  await expect(dialog.getByText("啱你心情")).toBeVisible();
  // Must show only title + reason.
  await expect(dialog.locator("a")).toHaveCount(0);
  await expect(dialog.getByText("華語流行")).toHaveCount(0);
  await expect(dialog.getByText("虛構意象測試句甲")).toHaveCount(0);
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(input).toBeFocused();
});
