import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";

import type { UserDTO } from "../types";
import { FieldRow, SectionCard } from "./detail-section";
import { NO_VALUE, formatDateTime } from "./format";

interface SessionsCardProps {
  user: UserDTO;
}

export function SessionsCard({ user }: SessionsCardProps) {
  const { t, i18n } = useTranslation("users");
  const { t: tCommon } = useTranslation();

  return (
    <SectionCard title={t("detail.sessions.title")} meta={NO_VALUE}>
      <dl className="flex flex-col">
        <FieldRow term={t("detail.sessions.lastAccess")}>{NO_VALUE}</FieldRow>
        <FieldRow term={t("detail.sessions.activeDevices")}>{NO_VALUE}</FieldRow>
        <FieldRow term={t("detail.sessions.lock")}>
          {user.lockedUntil === null
            ? t("detail.sessions.noLock")
            : formatDateTime(user.lockedUntil, i18n.language)}
        </FieldRow>
        <FieldRow term={t("detail.sessions.failedAttempts")}>
          {String(user.failedLoginAttempts)}
        </FieldRow>
      </dl>
      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          disabled
          title={`${t("detail.sessions.closeAll")} · ${tCommon("ui.list.pending")}`}
        >
          {t("detail.sessions.closeAll")}
        </Button>
        <p className="text-xs text-panel-subtle">{t("detail.sessions.closeAllHint")}</p>
      </div>
    </SectionCard>
  );
}
