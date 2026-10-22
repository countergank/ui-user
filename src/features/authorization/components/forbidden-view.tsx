import { useTranslation } from "react-i18next";

/**
 * 403 view (COU-275, T5 / S6). Rendered when the server denies an action the UI expected
 * to be allowed. Deliberately different from `ErrorView`: no retry (retrying a permission
 * failure loops) and a message about permissions, not the service. Reusable inline too.
 */
export function ForbiddenView() {
  const { t } = useTranslation("console");

  return (
    <section
      role="alert"
      aria-live="assertive"
      className="flex flex-col items-start gap-2 rounded-xl border border-destructive/40 bg-destructive/5 p-6"
    >
      <h2 className="text-xl font-semibold text-destructive">{t("forbidden.title")}</h2>
      <p className="max-w-prose text-foreground">{t("forbidden.message")}</p>
    </section>
  );
}
