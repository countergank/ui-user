import { Monitor, Smartphone } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { Can } from "@/features/authorization/components/can";
import { PERMISSIONS } from "@/features/authorization/permissions";
import type { ActiveSessionDTO } from "@/features/sessions/types";

import { NO_VALUE, formatDate, formatRelative } from "./format";

interface UserSessionsTableProps {
  sessions: ActiveSessionDTO[];
  onRevoke: (session: ActiveSessionDTO) => void;
}

/**
 * @returns The per-session table of the admin detail: one row per active session with the
 * device, the ip and the last activity; the per-row revoke action renders only for
 * `session:revoke` holders and defers to the caller's confirmation dialog.
 */
export function UserSessionsTable({ sessions, onRevoke }: UserSessionsTableProps) {
  const { t, i18n } = useTranslation("users");
  const language = i18n.language;

  return (
    <table className="w-full table-fixed text-left" data-testid="user-sessions-table">
      <caption className="sr-only">{t("detail.sessions.listCaption")}</caption>
      <thead>
        <tr className="text-[9.5px] font-mono uppercase tracking-wide text-muted-foreground">
          <th scope="col" className="px-[18px] py-2 font-normal">
            {t("detail.sessions.columns.device")}
          </th>
          <th scope="col" className="w-[150px] px-[18px] py-2 font-normal">
            {t("detail.sessions.columns.ip")}
          </th>
          <th scope="col" className="w-[180px] px-[18px] py-2 font-normal">
            {t("detail.sessions.columns.lastAccess")}
          </th>
          <th scope="col" className="w-[140px] px-[18px] py-2 font-normal">
            {t("detail.sessions.columns.action")}
          </th>
        </tr>
      </thead>
      <tbody>
        {sessions.map((session) => {
          const isMobile = /Mobi|Android|iPhone|iPad/i.test(session.device ?? "");

          return (
            <tr
              key={session.id}
              data-testid="user-session-row"
              className="border-t border-border/60"
            >
              <td className="px-[18px] py-3">
                <div className="flex items-center gap-2">
                  {isMobile ? (
                    <Smartphone
                      className="size-3.5 shrink-0 text-muted-foreground"
                      aria-hidden="true"
                    />
                  ) : (
                    <Monitor
                      className="size-3.5 shrink-0 text-muted-foreground"
                      aria-hidden="true"
                    />
                  )}
                  <span className="min-w-0 flex-1 truncate text-[12.5px] font-medium text-card-foreground">
                    {session.device ?? NO_VALUE}
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {t("detail.sessions.startedAt", {
                    date: formatDate(session.issuedAt, language),
                  })}{" "}
                  ·{" "}
                  {t("detail.sessions.expiresAt", {
                    date: formatDate(session.expiresAt, language),
                  })}
                </p>
              </td>
              <td className="px-[18px] py-3 font-mono text-[11px] text-muted-foreground">
                {session.ip ?? NO_VALUE}
              </td>
              <td className="px-[18px] py-3 text-[12px] text-card-foreground">
                <time
                  dateTime={session.lastAccessAt}
                  title={formatDate(session.lastAccessAt, language)}
                >
                  {formatRelative(session.lastAccessAt, language)}
                </time>
              </td>
              <td className="px-[18px] py-3">
                <Can permission={PERMISSIONS.sessionRevoke}>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 text-[11.5px] font-medium text-destructive hover:bg-transparent hover:text-destructive"
                    onClick={() => {
                      onRevoke(session);
                    }}
                  >
                    {t("detail.sessions.actions.revoke")}
                  </Button>
                </Can>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
