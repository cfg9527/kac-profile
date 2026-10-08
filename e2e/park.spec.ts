import { expect, test } from "@playwright/test";

/** Walk/tap to an object and see its section — desktop and mobile. */
test("clicking the signpost opens the intro section", async ({ page }) => {
  await page.goto("/");
  await page.getByTestId("park-object-signpost").click();
  const popup = page.getByTestId("section-popup");
  await expect(popup).toBeVisible({ timeout: 8000 });
  await expect(popup).toHaveAttribute("data-section", "intro");
});

test("keyboard walk moves KaC and Esc closes the popup", async ({ page }) => {
  await page.goto("/");
  const kac = page.getByTestId("character");
  const before = await kac.getAttribute("data-x");
  await page.getByTestId("park-scene").focus();
  await page.keyboard.press("ArrowRight");
  await expect
    .poll(async () => page.getByTestId("character").getAttribute("data-x"))
    .not.toBe(before);

  await page.getByTestId("park-object-mailbox").click();
  const popup = page.getByTestId("section-popup");
  await expect(popup).toBeVisible({ timeout: 8000 });
  await expect(popup).toHaveAttribute("data-section", "contact");
  await expect(page.getByTestId("github-link")).toHaveAttribute(
    "href",
    "https://github.com/cfg9527",
  );
  await page.keyboard.press("Escape");
  await expect(popup).toBeHidden();
});

test("tapping the ground moves KaC (on-screen d-pad removed in KPP-10)", async ({ page }) => {
  await page.goto("/");
  const kac = page.getByTestId("character");
  const before = await kac.getAttribute("data-y");
  const scene = page.getByTestId("park-scene");
  const box = (await scene.boundingBox())!;
  // centre of tile (6, 4), two tiles below KaC's start (6, 2)
  await scene.click({ position: { x: (box.width * 6.5) / 12, y: (box.height * 4.5) / 8 } });
  await expect
    .poll(async () => page.getByTestId("character").getAttribute("data-y"))
    .not.toBe(before);
});

test("language toggle switches copy and persists", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /像素公園/ })).toBeVisible();
  await page.getByTestId("lang-toggle").click();
  await expect(page.getByRole("heading", { name: /Pixel Park/ })).toBeVisible();
  await expect(
    await page.evaluate(() => window.localStorage.getItem("kac-park-lang")),
  ).toBe("en");
  await page.reload();
  await expect(page.getByRole("heading", { name: /Pixel Park/ })).toBeVisible();
});

test("accessible nav buttons open every section", async ({ page }) => {
  await page.goto("/");
  for (const section of ["intro", "interests", "projects", "contact"]) {
    await page.getByTestId(`nav-${section}`).click();
    await expect(page.getByTestId("section-popup")).toHaveAttribute(
      "data-section",
      section,
    );
    await page.keyboard.press("Escape");
    await expect(page.getByTestId("section-popup")).toBeHidden();
  }
});

test("tree opens the projects section with all three projects", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByTestId("park-object-tree").click();
  const popup = page.getByTestId("section-popup");
  await expect(popup).toBeVisible({ timeout: 8000 });
  await expect(popup).toHaveAttribute("data-section", "projects");
  await expect(popup.getByText("futa9")).toBeVisible();
  await expect(popup.getByText("QRNG")).toBeVisible();
});
