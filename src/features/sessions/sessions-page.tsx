import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { sessionStore, useSession } from "@/lib/session/session-store";

import { CloseAllDialog } from "./close-all-dialog";
import { useLogoutAll, useSessions } from "./hooks/use-sessions";
import { RevokeSessionDialog } from "./revoke-session-dialog";
import { SessionTable } from "./session-table";
import type { ActiveSessionDTO } from "./types";

/**
 * @returns The `/app/sessions` screen: the active-sessions table with the current session
 * distinguished (S2), per-row revocation behind a confirmation (S3), the sign-out-
 * everywhere action in the header (S4) and the loading, empty and error states (S6).
 */
export function SessionsPage() {
  const { t } = useTranslation("sessions");
  const { t: tCommon } = useTranslation();
  const sessionId = useSession((state) => state.sessionId);
  const sessions = useSessions();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [revokeTarget, setRevokeTarget] = useState<ActiveSessionDTO | null>(null);
  const [closeAllOpen, setCloseAllOpen] = useState(false);
  const logoutAll = useLogoutAll();

  const signOutLocally = () => {
    sessionStore.getState().clearSession();
    queryClient.clear();
    void navigate("/login", { replace: true });
  };

  return (
    <div className="flex w-full flex-col gap-5">
      <header className="flex items-center justify-between gap-6">
        <div className="flex flex-col gap-1.5">
          <h1 className="font-display text-[26px] font-bold leading-none tracking-tight">
            {t("view.heading")}
          </h1>
          <p className="text-[13px] text-muted-foreground">{t("view.subtitle")}</p>
        </div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={sessions.data === undefined || sessions.data.length === 0}
          onClick={() => {
            setCloseAllOpen(true);
          }}
        >
          {t("actions.closeAll")}
        </Button>
      </header>
      {sessions.isPending ? (
        // biome-ignore lint/a11y/useSemanticElements: intentional status live region, not an <output>
        <p role="status">{t("view.loading")}</p>
      ) : null}
      {sessions.isError ? (
        <Alert variant="destructive">
          <AlertDescription>{t("errors.fetchFailure")}</AlertDescription>
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
        </Alert>
      ) : null}
      {sessions.data !== undefined && sessions.data.length > 0 ? (
        <Card className="border-border bg-card">
          <CardContent className="flex flex-col gap-3 p-[18px]">
            <div className="flex items-center justify-between gap-4">
              <div className="flex flex-col gap-1">
                <h2 className="text-[14px] font-medium text-card-foreground">{t("list.title")}</h2>
                <p className="font-mono text-[10px] text-muted-foreground">{t("list.hint")}</p>
              </div>
            </div>
            <SessionTable
              sessions={sessions.data}
              currentSessionId={sessionId}
              onRevoke={setRevokeTarget}
            />
            <footer className="flex items-center justify-between gap-4 text-[11.5px] text-muted-foreground">
              <span>{t("list.footer", { count: sessions.data.length })}</span>
              <code className="rounded bg-muted px-2 py-1 font-mono text-[10px] text-muted-foreground">
                POST /auth/logout-all
              </code>
            </footer>
          </CardContent>
        </Card>
      ) : null}
      {sessions.data?.length === 0 ? (
        <p className="text-[13px] text-muted-foreground">{t("list.empty")}</p>
      ) : null}
      <RevokeSessionDialog
        session={revokeTarget}
        open={revokeTarget !== null}
        onOpenChange={(open) => {
          if (!open) {
            setRevokeTarget(null);
          }
        }}
      />
      <CloseAllDialog
        open={closeAllOpen}
        pending={logoutAll.isPending}
        onOpenChange={setCloseAllOpen}
        onConfirm={() => {
          logoutAll.mutate(undefined, {
            onSuccess: () => {
              signOutLocally();
            },
            onError: () => {
              setCloseAllOpen(false);
              toast.error(t("errors.closeAllFailure"));
            },
          });
        }}
      />
    </div>
  );
}
