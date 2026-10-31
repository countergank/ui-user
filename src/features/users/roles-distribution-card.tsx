import { useTranslation } from "react-i18next";

import { Card, CardContent } from "@/components/ui/card";

import { SIMULATED_METRICS } from "./users-list-metrics";

const ROLE_BARS = [
  { name: "admin", count: 8, width: "3%" },
  { name: "user", count: 1106, width: "94%" },
  { name: "viewer", count: 134, width: "11%" },
] as const;

const BAR_TONES = ["bg-accent-foreground", "bg-primary", "bg-accent"] as const;

export function RolesDistributionCard() {
  const { t } = useTranslation("users");

  return (
    <Card className="border-panel-border bg-panel text-panel-foreground">
      <CardContent className="flex flex-col gap-3 pt-6">
        <div className="flex items-baseline justify-between">
          <h2 className="text-sm font-medium">{t("list.side.roles.title")}</h2>
          <span className="font-mono text-xs text-muted-foreground">{SIMULATED_METRICS.roles}</span>
        </div>
        {ROLE_BARS.map((bar, index) => (
          <div key={bar.name} className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono">{bar.name}</span>
              <span className="tabular-nums text-muted-foreground">
                {bar.count.toLocaleString()}
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-canvas">
              <div
                className={`h-1.5 rounded-full ${BAR_TONES[index % BAR_TONES.length]}`}
                style={{ width: bar.width }}
              />
            </div>
          </div>
        ))}
        <p className="text-[11px] text-muted-foreground">{t("list.side.roles.footnote")}</p>
      </CardContent>
    </Card>
  );
}
