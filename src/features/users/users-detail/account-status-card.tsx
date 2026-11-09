import { useTranslation } from "react-i18next";

import type { UserDTO } from "../types";
import { FieldRow, SectionCard } from "./detail-section";
import { NO_VALUE } from "./format";

export function AccountStatusCard({ user }: { user: UserDTO }) {
  const { t } = useTranslation("users");
  const verification = user.emailVerified
    ? t("list.verification.verified")
    : t("list.verification.pending");
  const pendingEmail = user.hasPendingEmailChange
    ? t("detail.accountStatus.yes")
    : t("detail.accountStatus.no");
  const passwordReset = user.hasPendingPasswordReset
    ? t("detail.accountStatus.yes")
    : t("detail.accountStatus.no");

  return (
    <SectionCard title={t("detail.accountStatus.title")} meta={NO_VALUE}>
      <dl className="flex flex-col">
        <FieldRow term={t("detail.accountStatus.verification")}>{verification}</FieldRow>
        <FieldRow term={t("detail.accountStatus.pendingEmail")}>{pendingEmail}</FieldRow>
        <FieldRow term={t("detail.accountStatus.passwordReset")}>{passwordReset}</FieldRow>
      </dl>
    </SectionCard>
  );
}
