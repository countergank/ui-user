import { useTranslation } from "react-i18next";

import { FieldRow, SectionCard } from "./detail-section";
import { NO_VALUE } from "./format";

export function AccountStatusCard() {
  const { t } = useTranslation("users");

  return (
    <SectionCard title={t("detail.accountStatus.title")} meta={NO_VALUE}>
      <dl className="flex flex-col">
        <FieldRow term={t("detail.accountStatus.pendingEmail")}>{NO_VALUE}</FieldRow>
        <FieldRow term={t("detail.accountStatus.passwordReset")}>{NO_VALUE}</FieldRow>
        <FieldRow term={t("detail.accountStatus.verification")}>{NO_VALUE}</FieldRow>
      </dl>
    </SectionCard>
  );
}
