import { useTranslation } from "react-i18next";

/**
 * Lazy-loaded route module for "/about" (COU-310, T3 / S6).
 *
 * Describes the project, not the template: what it is, where it comes from and where the
 * standards it follows live. Public surface, so it renders inside `PublicLayout` and
 * never touches the API.
 */
export function Component() {
  const { t } = useTranslation("landing");

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-semibold tracking-tight">{t("about.title")}</h1>
      <p className="max-w-prose text-muted-foreground">{t("about.body")}</p>
    </div>
  );
}
