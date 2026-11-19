import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Can } from "@/features/authorization/components/can";
import { isForbiddenError } from "@/features/authorization/forbidden";
import { useCan } from "@/features/authorization/hooks/use-can";
import { PERMISSIONS } from "@/features/authorization/permissions";
import type { ActiveSessionDTO } from "@/features/sessions/types";

import { useLogoutAllUserSessions, useUserSessions } from "../hooks/use-user-sessions";
import type { UserDTO } from "../types";
import { CloseAllUserSessionsDialog } from "./close-all-user-sessions-dialog";
import { FieldRow, SectionCard } from "./detail-section";
import { NO_VALUE, formatDateTime } from "./format";
import { RevokeUserSessionDialog } from "./revoke-user-session-dialog";
import { UserSessionsTable } from "./user-sessions-table";

interface SessionsCardProps {
  user: UserDTO;
}

/**
 * @returns The "Sessions and security" card of the admin detail: the summary rows and the
 * per-session table fed by the admin sessions endpoint for `session:read` holders, with the
 * loading, empty, error and forbidden states, and the close-all action for `session:revoke`
 * holders.
 */
export function SessionsCard({ user }: SessionsCardProps) {
  const { t, i18n } = useTranslation("users");
  const { t: tCommon } = useTranslation();
  const canRead = useCan(PERMISSIONS.sessionRead);
  const sessions = useUserSessions(user.id, canRead);
  const logoutAll = useLogoutAllUserSessions();
  const [revokeTarget, setRevokeTarget] = useState<ActiveSessionDTO | null>(null);
  const [closeAllOpen, setCloseAllOpen] = useState(false);

  const language = i18n.language;
  const activeSessions = sessions.data ?? [];
  const latest =
    activeSessions.length === 0
      ? null
      : activeSessions.reduce((latest, session) =>
          new Date(session.lastAccessAt).getTime() > new Date(latest.lastAccessAt).getTime()
            ? session
            : latest,
        );

  return (
    <SectionCard
      title={t("detail.sessions.title")}
      meta={<span className="font-mono text-[11px]">{t("detail.sessions.hint")}</span>}
    >
      <dl className="flex flex-col">
        <FieldRow term={t("detail.sessions.lastAccess")}>
          {latest === null
            ? NO_VALUE
            : `${formatDateTime(latest.lastAccessAt, language)} · ${latest.ip ?? NO_VALUE}`}
        </FieldRow>
        <FieldRow term={t("detail.sessions.activeDevices")}>
          {t("detail.sessions.deviceCount", { count: activeSessions.length })}
        </FieldRow>
        <FieldRow term={t("detail.sessions.lock")}>
          {user.lockedUntil === null
            ? t("detail.sessions.noLock")
            : formatDateTime(user.lockedUntil, language)}
        </FieldRow>
        <FieldRow term={t("detail.sessions.failedAttempts")}>
          {String(user.failedLoginAttempts)}
        </FieldRow>
      </dl>
      {!canRead || isForbiddenError(sessions.error) ? (
        <p role="alert">{t("detail.sessions.forbidden")}</p>
      ) : sessions.isPending ? (
        <p aria-live="polite">{t("detail.sessions.loading")}</p>
      ) : sessions.isError ? (
        <div role="alert" className="flex flex-col items-start gap-3">
          <p>{t("detail.sessions.error")}</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              void sessions.refetch();
            }}
          >
            {tCommon("error.retry")}
          </Button>
        </div>
      ) : activeSessions.length === 0 ? (
        <p>{t("detail.sessions.empty")}</p>
      ) : (
        <UserSessionsTable sessions={activeSessions} onRevoke={setRevokeTarget} />
      )}
      <Can permission={PERMISSIONS.sessionRevoke}>
        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            onClick={() => {
              setCloseAllOpen(true);
            }}
          >
            {t("detail.sessions.closeAll")}
          </Button>
          <p className="text-xs text-panel-subtle">{t("detail.sessions.closeAllHint")}</p>
        </div>
      </Can>
      <RevokeUserSessionDialog
        userId={user.id}
        session={revokeTarget}
        open={revokeTarget !== null}
        onOpenChange={(open) => {
          if (!open) {
            setRevokeTarget(null);
          }
        }}
      />
      <CloseAllUserSessionsDialog
        open={closeAllOpen}
        pending={logoutAll.isPending}
        onOpenChange={setCloseAllOpen}
        onConfirm={() => {
          logoutAll.mutate(
            { id: user.id },
            {
              onSuccess: () => {
                setCloseAllOpen(false);
                toast.success(t("detail.sessions.success.closedAll"));
              },
              onError: () => {
                toast.error(t("detail.sessions.errors.closeAllFailure"));
              },
            },
          );
        }}
      />
    </SectionCard>
  );
}
