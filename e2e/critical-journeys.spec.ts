// e2e/critical-journeys.spec.ts
// Critical user journeys of the public surface (COU-310, ADR-13): landmarks, keyboard
// navigation through the skip link and the site navigation, route announcements,
// reduced-motion handling and axe scans.
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import type { Locator, Page } from "@playwright/test";

// The expected copy is derived from the English bundle, the reference language, instead of
// being retyped here: a copy change must not turn into a red e2e run.
import { en } from "../src/lib/i18n/locales/en";

const SITE_TITLE = en.landing.title;
const ABOUT_TITLE = en.landing.about.title;
const skipLinkLabel = en.common.shell.skipLink;
const publicNavLabel = en.landing.nav.label;
const loadedAnnouncement = (title: string) =>
  en.common.shell.routeAnnouncer.loaded.replace("{{title}}", title);

const skipLink = (page: Page) => page.getByRole("link", { name: skipLinkLabel });
const publicNav = (page: Page) => page.getByRole("navigation", { name: publicNavLabel });

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

test.describe("public surface journeys", () => {
  test("declares the page language and exposes the expected landmarks", async ({ page }) => {
    await page.goto("/");

    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.getByRole("banner")).toBeVisible();
    await expect(publicNav(page)).toBeVisible();
    await expect(page.getByRole("main")).toBeVisible();
    await expect(page.getByRole("contentinfo")).toBeVisible();
    // The informational home explains how to run the project.
    await expect(page.getByText("docker compose up")).toBeVisible();
  });

  test("skip link is the first Tab stop and jumps focus to main content", async ({ page }) => {
    await focusDocumentHeadless(page);

    await page.keyboard.press("Tab");
    await expectFocused(skipLink(page));

    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/#main-content/);
    await expectFocused(page.getByRole("main"));
  });

  test("keyboard users can tab through navigation to reach the About route", async ({ page }) => {
    await focusDocumentHeadless(page);

    await page.keyboard.press("Tab");
    await expectFocused(skipLink(page));
    // The public header starts with the brand link back to the informational home, so it
    // is the second Tab stop — the console shell used a non-focusable label instead.
    await page.keyboard.press("Tab");
    await expectFocused(page.getByRole("banner").getByRole("link", { name: SITE_TITLE }));
    await page.keyboard.press("Tab");
    await expectFocused(publicNav(page).getByRole("link", { name: en.landing.nav.home }));
    await page.keyboard.press("Tab");
    await expectFocused(publicNav(page).getByRole("link", { name: en.landing.nav.about }));

    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/about/);
    await expect(page.getByRole("heading", { level: 1, name: ABOUT_TITLE })).toBeVisible();
    await expectFocused(page.getByRole("main"));
  });

  test("route changes are announced to assistive technology", async ({ page }) => {
    await page.goto("/");

    const status = page.getByRole("status");
    await expect(status).toHaveText(loadedAnnouncement(SITE_TITLE));

    await publicNav(page).getByRole("link", { name: en.landing.nav.about }).click();
    await expect(status).toHaveText(loadedAnnouncement(ABOUT_TITLE));
  });
});

test.describe("motion journey", () => {
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
});

test.describe("automated accessibility audits", () => {
  test("landing and about pages pass axe scans in a real browser", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1, name: SITE_TITLE })).toBeVisible();
    const landingResults = await new AxeBuilder({ page }).analyze();
    expect(landingResults.violations).toEqual([]);

    await publicNav(page).getByRole("link", { name: en.landing.nav.about }).click();
    await expect(page.getByRole("heading", { level: 1, name: ABOUT_TITLE })).toBeVisible();
    const aboutResults = await new AxeBuilder({ page }).analyze();
    expect(aboutResults.violations).toEqual([]);
  });
});
