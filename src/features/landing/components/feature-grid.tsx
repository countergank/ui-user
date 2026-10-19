import { Accessibility, Code2, Languages, ShieldCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Card, CardContent, CardHeader } from "@/components/ui/card";

/**
 * Feature grid (COU-310, T10 / S13).
 *
 * Each card pairs one claim with an icon so the block is scannable, and the four claims
 * are the ones the repository actually backs with code and tests — session renewal,
 * accessibility, the three languages and the typed stack.
 */
const FEATURES: { key: "session" | "accessibility" | "languages" | "typed"; Icon: LucideIcon }[] = [
  { key: "session", Icon: ShieldCheck },
  { key: "accessibility", Icon: Accessibility },
  { key: "languages", Icon: Languages },
  { key: "typed", Icon: Code2 },
];

export function FeatureGrid() {
  const { t } = useTranslation("landing");

  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {FEATURES.map(({ key, Icon }) => (
        <li key={key}>
          <Card className="h-full transition-shadow hover:shadow-md">
            <CardHeader className="flex-row items-center gap-3 space-y-0">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-foreground">
                <Icon aria-hidden="true" className="size-4" />
              </span>
              <h3 className="font-semibold leading-none tracking-tight">
                {t(`features.items.${key}.title`)}
              </h3>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {t(`features.items.${key}.description`)}
              </p>
            </CardContent>
          </Card>
        </li>
      ))}
    </ul>
  );
}
