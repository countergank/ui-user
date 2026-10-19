import { useTranslation } from "react-i18next";

/**
 * Informational home of the project (COU-310, T2 / ADR-13).
 *
 * Static content on purpose: the public surface never calls the API (S7), so a visitor
 * sees what the project is and how to run it without a session, a request or a spinner.
 */
export function LandingPage() {
  const { t } = useTranslation("landing");

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-4xl font-semibold tracking-tight">{t("title")}</h1>
      <p className="max-w-prose text-lg text-muted-foreground">{t("subtitle")}</p>
    </div>
  );
}
