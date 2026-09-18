// e2e/critical-journeys.spec.ts
// Critical user journeys for the standard frontend template (TEST-4):
// keyboard navigation (skip link, landmarks), route announcements, data-failure
// recovery, prefers-reduced-motion handling, and automated axe scans.
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import type { Locator, Page } from "@playwright/test";

const skipLink = () => (page: Page) =>
  page.getByRole("link", { name: "Skip to main content" });
const mainNav = (page: Page) => page.getByRole("navigation", { name: "Main navigation" });

// Headless Chromium cannot report window focus, so Playwright's toBeFocused()
// always times out as "inactive" here. Asserting real focus behaviour instead:
// the element must be document.activeElement. Same semantics, headless-safe.
async function expectFocused(locator: Locator) {
  await expect(locator).toHaveCount(1);
  await expect
    .poll(() => locator.evaluate((el) => el === document.activeElement), { timeout: 5000 })
    .toBe(true);
}

// Headless Chromium does not always grant the page window focus after
// page.goto(), which makes Tab traversal non-deterministic (the first Tab can
// land anywhere). Making body programmatically focusable and focusing it before
// walking the tab order makes `document.activeElement` traversal deterministic
// and headless-safe. The tabindex stays a live-DOM test-only change: it is
// never persisted to source and does not alter the shipped tab order. The
// skip-link wait also guarantees React has committed before the first Tab.
async function focusDocumentHeadless(page: Page) {
  await page.goto("/");
  await page.locator(".skip-link").waitFor();
  await page.bringToFront();
  await page.evaluate(() => {
    window.focus();
    document.body.setAttribute("tabindex", "-1");
    document.body.focus();
  });
}

test.describe("shell and keyboard journeys", () => {
  test("declares the page language and exposes the expected landmarks", async ({ page }) => {
    await page.goto("/");

    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.getByRole("banner")).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Main navigation" })).toBeVisible();
    await expect(page.getByRole("main")).toBeVisible();
    await expect(page.getByRole("contentinfo")).toBeVisible();
  });

  test("skip link is the first Tab stop and jumps focus to main content", async ({ page }) => {
    await focusDocumentHeadless(page);

    await page.keyboard.press("Tab");
    await expectFocused(skipLink()(page));

    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/#main-content/);
    await expectFocused(page.getByRole("main"));
  });

  test("keyboard users can tab through navigation to reach the About route", async ({ page }) => {
    await focusDocumentHeadless(page);

    await page.keyboard.press("Tab");
    await expectFocused(skipLink()(page));
    await page.keyboard.press("Tab");
    await expectFocused(mainNav(page).getByRole("link", { name: "Home" }));
    await page.keyboard.press("Tab");
    await expectFocused(mainNav(page).getByRole("link", { name: "About" }));

    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/about/);
    await expect(page.getByRole("heading", { name: "About" })).toBeVisible();
    await expectFocused(page.getByRole("main"));
  });

  test("route changes are announced to assistive technology", async ({ page }) => {
    await page.goto("/");

    const status = page.getByRole("status");
    await expect(status).toHaveText("Home page loaded");

    await mainNav(page).getByRole("link", { name: "About" }).click();
    await expect(status).toHaveText("About page loaded");
  });
});

test.describe("motion and failure journeys", () => {
  test("honors prefers-reduced-motion by disabling transitions", async ({ page }) => {
    await page.goto("/");

    // Wait for the SPA mount so document.querySelector finds the skip link;
    // page.evaluate is synchronous and must not race React's first commit.
    await page.locator(".skip-link").waitFor();

    const transitionMs = () =>
      page.evaluate(() => {
        const el = document.querySelector(".skip-link");
        const value = getComputedStyle(el as Element).transitionDuration;
        return Math.round(parseFloat(value) * 1000);
      });

    // Default: the skip-link transition (0.1s) is intact.
    expect(await transitionMs()).toBeGreaterThanOrEqual(100);

    // Reduced motion: universal 0.01ms override wins (WCAG 2.2 reduced-motion).
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.reload();
    // React must commit again after the reload before querySelector resolves.
    await page.locator(".skip-link").waitFor();
    expect(await transitionMs()).toBeLessThanOrEqual(1);
  });

  test("a data failure renders an accessible error and recovers on retry", async ({ page }) => {
    await page.goto("/#fail");

    const alert = page.getByRole("alert");
    await expect(alert).toContainText("Could not load template highlights");

    // Remove the failure cause, then keyboard-activate the retry action.
    await page.evaluate(() => {
      window.location.hash = "";
    });
    await alert.getByRole("button", { name: "Try again" }).focus();
    await page.keyboard.press("Enter");

    await expect(
      page.getByRole("heading", { name: /standard frontend template/i }),
    ).toBeVisible();
  });
});

test.describe("automated accessibility audits", () => {
  test("home and about pages pass axe scans in a real browser", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: /standard frontend template/i }),
    ).toBeVisible();
    const homeResults = await new AxeBuilder({ page }).analyze();
    expect(homeResults.violations).toEqual([]);

    await mainNav(page).getByRole("link", { name: "About" }).click();
    await expect(page.getByRole("heading", { name: "About" })).toBeVisible();
    const aboutResults = await new AxeBuilder({ page }).analyze();
    expect(aboutResults.violations).toEqual([]);
  });
});