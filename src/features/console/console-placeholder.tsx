import { useTranslation } from "react-i18next";

/**
 * The console's section placeholder (COU-278).
 *
 * The shell ships before the sections do (COU-289 onwards), and the navigation manifest
 * already points at all of them. Rendering the router's error boundary on a section link
 * would read as a broken console, so a section that has no ticket yet lands here: inside
 * the shell, with one heading, saying plainly that the content is not built.
 *
 * It is scaffolding, not content: each section ticket replaces its own route with the real
 * page and this component stops being reachable from that section (S5 keeps content out of
 * scope for COU-278).
 */
export function ConsolePlaceholder() {
  const { t } = useTranslation("console");

  return (
    <div className="rounded-lg border bg-background p-8">
      <h1 className="text-2xl font-semibold tracking-tight">{t("placeholder.title")}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{t("placeholder.body")}</p>
    </div>
  );
}
