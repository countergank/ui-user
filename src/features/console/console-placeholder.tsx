import { useTranslation } from "react-i18next";

export function ConsolePlaceholder() {
  const { t } = useTranslation("console");

  return (
    <div className="rounded-lg border bg-background p-8">
      <h1 className="text-2xl font-semibold tracking-tight">{t("placeholder.title")}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{t("placeholder.body")}</p>
    </div>
  );
}
