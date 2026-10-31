import { useTranslation } from "react-i18next";

import { Card, CardContent } from "@/components/ui/card";

const AUDIT_ROWS = [
  { action: "user.update", meta: "user · 200 · 84ms", time: "list.side.audit.m2" },
  { action: "auth.logout-all", meta: "session · 204 · 41ms", time: "list.side.audit.m6" },
  { action: "role.update.permissions", meta: "role · 200 · 96ms", time: "list.side.audit.m14" },
  { action: "user.unlock", meta: "user · 200 · 63ms", time: "list.side.audit.m21" },
  { action: "parameter.update", meta: "parameter · 200 · 58ms", time: "list.side.audit.m38" },
  { action: "email.send", meta: "email · 202 · 412ms", time: "list.side.audit.m45" },
] as const;

const DOT_TONES = [
  "bg-success",
  "bg-success",
  "bg-accent-foreground",
  "bg-warning",
  "bg-warning",
  "bg-info",
] as const;

export function RecentAuditCard() {
  const { t } = useTranslation("users");

  return (
    <Card className="border-panel-border bg-panel text-panel-foreground">
      <CardContent className="flex flex-col gap-3 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium">{t("list.side.audit.title")}</h2>
          <span
            className="font-mono text-[11px] text-muted-foreground"
            title={`${t("list.side.audit.seeAll")} · ${t("list.pendingFeature")}`}
          >
            {t("list.side.audit.seeAll")}
          </span>
        </div>
        {AUDIT_ROWS.map((row, index) => (
          <div key={row.action} className="flex items-center gap-2.5">
            <span
              aria-hidden="true"
              className={`h-1.5 w-1.5 shrink-0 rounded-full ${DOT_TONES[index % DOT_TONES.length]}`}
            />
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="truncate font-mono text-xs">{row.action}</span>
              <span className="truncate text-[11px] text-muted-foreground">{row.meta}</span>
            </span>
            <span className="shrink-0 text-[11px] text-muted-foreground">{t(row.time)}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
