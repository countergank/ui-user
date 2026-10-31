import { useTranslation } from "react-i18next";

import { FieldRow, SectionCard } from "./detail-section";
import { NO_VALUE } from "./format";

export function PermissionsCard() {
  const { t } = useTranslation("users");

  return (
    <SectionCard title={t("detail.permissions.title")} meta={NO_VALUE}>
      <dl className="flex flex-col">
        <FieldRow term={t("detail.permissions.direct")}>{NO_VALUE}</FieldRow>
        <FieldRow term={t("detail.permissions.groupUser")} mono>
          {NO_VALUE}
        </FieldRow>
        <FieldRow term={t("detail.permissions.groupSystem")} mono>
          {NO_VALUE}
        </FieldRow>
      </dl>
    </SectionCard>
  );
}
