import { useTranslation } from "react-i18next";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Lazy-loaded route module for "/about" (bundle-001).
 * Deliberately simple to demonstrate the lazy route + Suspense boundary path.
 * All copy comes from the i18n resources (COU-253).
 */
export function Component() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-semibold tracking-tight">{t("about.heading")}</h1>
      <Card>
        <CardHeader>
          <CardTitle>{t("about.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="max-w-prose text-muted-foreground">{t("about.description")}</p>
        </CardContent>
      </Card>
    </div>
  );
}
