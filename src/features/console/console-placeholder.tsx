import { useTranslation } from "react-i18next";

/**
 * Placeholder for a console section (COU-278) whose page does not exist yet: it renders
 * inside the shell with one heading instead of the router's error boundary, so a section
 * link never reads as a broken console. Each section ticket replaces it.
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
