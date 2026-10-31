import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { SectionCard } from "./detail-section";

const ADMIN_ACTIONS = [
  { key: "unlock", verb: "PATCH", destructive: false },
  { key: "deactivate", verb: "PATCH", destructive: false },
  { key: "resetPassword", verb: "POST", destructive: false },
  { key: "resendVerification", verb: "POST", destructive: false },
  { key: "changeEmail", verb: "POST", destructive: false },
  { key: "delete", verb: "DELETE", destructive: true },
] as const;

export function AdminActionsCard() {
  const { t } = useTranslation("users");
  const { t: tCommon } = useTranslation();

  return (
    <SectionCard title={t("detail.adminActions.title")}>
      <div className="flex flex-col">
        {ADMIN_ACTIONS.map((action) => (
          <Button
            key={action.key}
            type="button"
            variant="ghost"
            disabled
            title={`${t(`detail.adminActions.${action.key}`)} · ${tCommon("ui.list.pending")}`}
            className={cn(
              "w-full justify-between rounded-none border-b border-panel-border",
              action.destructive && "text-destructive",
            )}
          >
            {t(`detail.adminActions.${action.key}`)}
            <span className="font-mono text-[10px] text-panel-subtle">{action.verb}</span>
          </Button>
        ))}
      </div>
    </SectionCard>
  );
}
