import { useTranslation } from "react-i18next";

import type { UserDTO } from "../types";
import { FieldRow, SectionCard } from "./detail-section";
import { formatDateTime, formatRelative } from "./format";

interface ProfileCardProps {
  user: UserDTO;
}

export function ProfileCard({ user }: ProfileCardProps) {
  const { t, i18n } = useTranslation("users");

  return (
    <SectionCard
      title={t("detail.profile.title")}
      meta={t("detail.profile.updated", { value: formatRelative(user.updatedAt, i18n.language) })}
    >
      <dl className="flex flex-col">
        <FieldRow term={t("detail.fields.name")}>{user.name}</FieldRow>
        <FieldRow term={t("detail.fields.lastName")}>{user.lastName}</FieldRow>
        <FieldRow term={t("detail.fields.userName")} mono>
          {user.userName}
        </FieldRow>
        <FieldRow term={t("detail.fields.email")}>{user.email}</FieldRow>
        <FieldRow term={t("detail.fields.role")} mono>
          {user.role}
        </FieldRow>
        <FieldRow term={t("detail.fields.createdAt")}>
          {formatDateTime(user.createdAt, i18n.language)}
        </FieldRow>
        <FieldRow term={t("detail.fields.updatedAt")}>
          {formatDateTime(user.updatedAt, i18n.language)}
        </FieldRow>
      </dl>
    </SectionCard>
  );
}
