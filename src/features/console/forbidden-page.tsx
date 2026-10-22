import { useTranslation } from "react-i18next";

import { ForbiddenView } from "@/features/authorization/components/forbidden-view";

/**
 * The `/forbidden` page (COU-274, T3 / S2, S7): a destination, not an error state — a
 * denied route has to be somewhere a person can land, reload and share. The heading is
 * visually hidden so the page has one `h1`; `ForbiddenView` states the problem visibly.
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
