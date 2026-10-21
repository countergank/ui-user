import { useTranslation } from "react-i18next";

import { ForbiddenView } from "@/features/authorization/components/forbidden-view";

/**
 * The `/forbidden` page (COU-274, T3 / S2, S7).
 *
 * A destination, not an error state: a denied route has to be somewhere a person can land,
 * reload and share, and `/app/roles` answering "not found" would send them hunting for a bug
 * that does not exist.
 *
 * The heading is visually hidden because `ForbiddenView` already states the problem in
 * visible copy; it exists so the page has one `h1`, which the console's other routes all
 * have and a screen reader expects after a navigation.
 */
export function ForbiddenPage() {
  const { t } = useTranslation("console");

  return (
    <div>
      <h1 className="sr-only">{t("forbidden.title")}</h1>
      <ForbiddenView />
    </div>
  );
}
