import { Monitor, Smartphone } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { NO_VALUE, formatDate, formatRelative } from "@/features/users/users-detail/format";

import type { ActiveSessionDTO } from "./types";

interface SessionTableProps {
  sessions: ActiveSessionDTO[];
  currentSessionId: string | null;
  onRevoke: (session: ActiveSessionDTO) => void;
}

/**
 * @returns The active-sessions table (S1): one row per session with the device, the ip, the
 * last activity and the per-row revoke action (S3); the current session carries the
 * distinguishing badge and no revoke action (S2).
 */
export function SessionTable({ sessions, currentSessionId, onRevoke }: SessionTableProps) {
  const { t, i18n } = useTranslation("sessions");
  const language = i18n.language;

  return (
    <table className="w-full table-fixed text-left" data-testid="sessions-table">
      <caption className="sr-only">{t("list.title")}</caption>
      <thead>
        <tr className="text-[9.5px] font-mono uppercase tracking-wide text-muted-foreground">
          <th scope="col" className="px-[18px] py-2 font-normal">
            {t("list.columns.device")}
          </th>
          <th scope="col" className="w-[150px] px-[18px] py-2 font-normal">
            {t("list.columns.ip")}
          </th>
          <th scope="col" className="w-[180px] px-[18px] py-2 font-normal">
            {t("list.columns.lastAccess")}
          </th>
          <th scope="col" className="w-[140px] px-[18px] py-2 font-normal">
            {t("list.columns.action")}
          </th>
        </tr>
      </thead>
      <tbody>
        {sessions.map((session) => {
          const current = session.id === currentSessionId;
          const isMobile = /Mobi|Android|iPhone|iPad/i.test(session.device ?? "");

          return (
            <tr
              key={session.id}
              data-testid="session-row"
              data-current={current}
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
                  {current ? (
                    <Badge
                      variant="secondary"
                      className="bg-primary-soft text-primary"
                      title={t("list.currentHint")}
                    >
                      {t("list.currentBadge")}
                    </Badge>
                  ) : null}
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {t("list.startedAt", { date: formatDate(session.issuedAt, language) })} ·{" "}
                  {t("list.expiresAt", { date: formatDate(session.expiresAt, language) })}
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
                {current ? (
                  <span className="text-muted-foreground" aria-hidden="true">
                    —
                  </span>
                ) : (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 text-[11.5px] font-medium text-destructive hover:bg-transparent hover:text-destructive"
                    onClick={() => {
                      onRevoke(session);
                    }}
                  >
                    {t("actions.revoke")}
                  </Button>
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
