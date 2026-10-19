import { ArrowRight, BookOpen, FlaskConical, GitBranch, LayoutTemplate } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { docUrl, issuesUrl } from "@/lib/links";

/**
 * About page (COU-310, T11 / S6, S13).
 *
 * Describes the project, not the template, and points at the standards it actually
 * follows: each link goes to a file that exists in `docs/`. Public surface, so it renders
 * inside `PublicLayout` and never touches the API.
 */
const STANDARDS = [
  { key: "adr", file: "adr.md", Icon: GitBranch },
  { key: "patterns", file: "component-patterns.md", Icon: LayoutTemplate },
  { key: "accessibility", file: "accessibility.md", Icon: BookOpen },
  { key: "testing", file: "testing.md", Icon: FlaskConical },
] as const;

export function Component() {
  const { t } = useTranslation("landing");

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-12">
      <header className="flex flex-col gap-3">
        <h1 className="text-3xl font-semibold tracking-tight">{t("about.title")}</h1>
        <p className="max-w-prose text-muted-foreground">{t("about.body")}</p>
      </header>

      <div className="grid gap-8 sm:grid-cols-[1.1fr_1fr]">
        <section className="flex flex-col gap-4">
          <h2 className="text-2xl font-semibold tracking-tight">{t("about.standards.title")}</h2>
          <p className="text-muted-foreground">{t("about.standards.body")}</p>
          <ul className="flex flex-col gap-2">
            {STANDARDS.map(({ key, file, Icon }) => (
              <li key={key}>
                <a
                  className="inline-flex items-center gap-2 text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  href={docUrl(file)}
                  rel="noreferrer"
                  target="_blank"
                >
                  <Icon aria-hidden="true" className="size-4" />
                  {t(`about.standards.${key}`)}
                </a>
              </li>
            ))}
          </ul>
        </section>

        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold tracking-tight">{t("about.contribute.title")}</h2>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">{t("about.contribute.body")}</p>
            <a
              className="inline-flex items-center gap-2 text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              href={issuesUrl}
              rel="noreferrer"
              target="_blank"
            >
              {t("about.contribute.cta")}
              <ArrowRight aria-hidden="true" className="size-4" />
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
