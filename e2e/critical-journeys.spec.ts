import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import type { Locator, Page } from "@playwright/test";

import { en } from "../src/lib/i18n/locales/en";

const SITE_TITLE = en.landing.title;
const ABOUT_TITLE = en.landing.about.title;
const skipLinkLabel = en.common.shell.skipLink;
const publicNavLabel = en.landing.nav.label;
const loadedAnnouncement = (title: string) =>
  en.common.shell.routeAnnouncer.loaded.replace("{{title}}", title);

const skipLink = (page: Page) => page.getByRole("link", { name: skipLinkLabel });
const publicNav = (page: Page) => page.getByRole("navigation", { name: publicNavLabel });

async function expectFocused(locator: Locator) {
  await expect(locator).toHaveCount(1);
  await expect
    .poll(() => locator.evaluate((el) => el === document.activeElement), { timeout: 5000 })
    .toBe(true);
}

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

test.describe("layout journey", () => {
  test("the footer sits at the bottom of a short page", async ({ page }) => {
    await page.goto("/about");
    await expect(page.getByRole("heading", { level: 1, name: ABOUT_TITLE })).toBeVisible();

    const gap = await page.evaluate(() => {
      const footer = document.querySelector("footer");
      if (!footer) throw new Error("the page has no footer");
      return Math.round(window.innerHeight - footer.getBoundingClientRect().bottom);
    });

    expect(Math.abs(gap)).toBeLessThanOrEqual(1);
  });
});

test.describe("motion journey", () => {
  test("honors prefers-reduced-motion by disabling transitions", async ({ page }) => {
    await page.goto("/");

    await page.locator(".skip-link").waitFor();

    const transitionMs = () =>
      page.evaluate(() => {
        const el = document.querySelector(".skip-link");
        const value = getComputedStyle(el as Element).transitionDuration;
        return Math.round(parseFloat(value) * 1000);
      });

    expect(await transitionMs()).toBeGreaterThanOrEqual(100);

    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.reload();
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
