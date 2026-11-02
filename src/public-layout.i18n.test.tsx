import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, describe, expect, it } from "vitest";

import { i18n } from "@/lib/i18n";

import { PublicLayout } from "./public-layout";

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route Component={PublicLayout}>
          <Route index element={<p>landing content</p>} />
          <Route path="about" element={<p>about content</p>} />
        </Route>
        <Route path="/login" element={<p>login content</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

afterEach(async () => {
  await i18n.changeLanguage("en");
});

describe("reference screen copy per language", () => {
  it.each(["en", "es", "pt"] as const)(
    "renders the localized landmarks and navigation in %s",
    async (language) => {
      await i18n.changeLanguage(language);
      const t = i18n.getFixedT(language, "landing");

      renderAt("/");

      expect(screen.getByRole("navigation", { name: t("nav.label") })).toBeInTheDocument();
      expect(screen.getByRole("banner")).toBeInTheDocument();
      expect(screen.getByRole("main")).toBeInTheDocument();
      expect(screen.getByRole("contentinfo")).toBeInTheDocument();
    },
  );
});
