import { useTranslation } from "react-i18next";

import { Card, CardContent, CardHeader } from "@/components/ui/card";

/**
 * Informational home of the project (COU-310, T2 / ADR-13).
 *
 * Static content on purpose: a public surface never calls the API (S7), so a visitor
 * learns what the project is and how to run it without a session or a request. Every
 * string comes from the `landing` namespace (S5) and the colour decisions are token
 * utilities, never inline styles (S8).
 */

const FEATURE_KEYS = ["session", "accessibility", "languages", "typed"] as const;

export function LandingPage() {
  const { t } = useTranslation("landing");

  return (
    <div className="flex flex-col gap-12">
      <header className="flex flex-col gap-4">
        <h1 className="text-4xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="max-w-prose text-lg text-muted-foreground">{t("subtitle")}</p>
      </header>

      <section className="flex flex-col gap-3">
        <h2 className="text-2xl font-semibold tracking-tight">{t("what.title")}</h2>
        <p className="max-w-prose text-muted-foreground">{t("what.body")}</p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-2xl font-semibold tracking-tight">{t("service.title")}</h2>
        <p className="max-w-prose text-muted-foreground">{t("service.body")}</p>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-semibold tracking-tight">{t("features.title")}</h2>
        <ul className="grid gap-4 sm:grid-cols-2">
          {FEATURE_KEYS.map((key) => (
            <li key={key}>
              <Card className="h-full">
                <CardHeader>
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
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-2xl font-semibold tracking-tight">{t("quickstart.title")}</h2>
        <p className="max-w-prose text-muted-foreground">{t("quickstart.body")}</p>
        {/* A command is code, not copy: it is rendered verbatim, never translated. */}
        <pre className="w-full max-w-prose overflow-x-auto rounded-lg border bg-muted p-4 text-sm">
          <code>{t("quickstart.command")}</code>
        </pre>
        <p className="max-w-prose text-sm text-muted-foreground">{t("quickstart.note")}</p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-2xl font-semibold tracking-tight">{t("stack.title")}</h2>
        <p className="max-w-prose text-muted-foreground">{t("stack.body")}</p>
      </section>
    </div>
  );
}
