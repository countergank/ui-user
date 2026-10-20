import { useTranslation } from "react-i18next";

/**
 * 403 view (COU-275, T5 / S6).
 *
 * Rendered when the server denies an action the UI expected to be allowed — a permission
 * revoked in another tab, a role changed while the console was open, or a section whose
 * permission the client never learned. It is deliberately different from `ErrorView`:
 * no retry button (retrying a permission failure just loops) and a message that points at
 * permissions rather than at the service.
 *
 * It is the reusable half of the pair: the route boundary imports it, and a feature that
 * expects a 403 from a specific request can render the same view inline.
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
