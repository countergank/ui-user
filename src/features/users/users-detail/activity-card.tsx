import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";

import { SectionCard } from "./detail-section";
import { NO_VALUE } from "./format";

export function ActivityCard() {
  const { t } = useTranslation("users");
  const { t: tCommon } = useTranslation();

  return (
    <SectionCard
      title={t("detail.activity.title")}
      meta={
        <Button
          type="button"
          variant="link"
          size="sm"
          className="h-auto p-0 text-xs"
          disabled
          title={`${t("detail.activity.viewAll")} · ${tCommon("ui.list.pending")}`}
        >
          {t("detail.activity.viewAll")}
        </Button>
      }
    >
      <p className="text-sm text-panel-subtle">{NO_VALUE}</p>
    </SectionCard>
  );
}
