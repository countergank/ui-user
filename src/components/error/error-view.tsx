import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";

interface ErrorViewProps {
  title: string;
  message: string;
  onRetry?: () => void;
}

export function ErrorView({ title, message, onRetry }: ErrorViewProps) {
  const { t } = useTranslation();
  return (
    <section
      role="alert"
      aria-live="assertive"
      className="flex flex-col items-start gap-4 rounded-xl border border-destructive/40 bg-destructive/5 p-6"
    >
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-semibold text-destructive">{title}</h2>
        <p className="max-w-prose text-foreground">{message}</p>
      </div>
      {onRetry ? (
        <Button type="button" variant="outline" onClick={onRetry}>
          {t("error.retry")}
        </Button>
      ) : null}
    </section>
  );
}
