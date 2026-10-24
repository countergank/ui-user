import { useTranslation } from "react-i18next";

import { ForbiddenView } from "@/features/authorization/components/forbidden-view";

export function ForbiddenPage() {
  const { t } = useTranslation("console");

  return (
    <div>
      <h1 className="sr-only">{t("forbidden.title")}</h1>
      <ForbiddenView />
    </div>
  );
}
