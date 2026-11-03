import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";

interface ErrorViewProps {
  title: string;
  message: string;
  traceId?: string;
  onRetry?: () => void;
}

export function ErrorView({ title, message, traceId, onRetry }: ErrorViewProps) {
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
      {traceId ? (
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="font-mono">{traceId}</span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs"
            onClick={() => {
              void navigator.clipboard.writeText(traceId);
            }}
          >
            {t("error.traceId.copy")}
          </Button>
        </p>
      ) : null}
      {onRetry ? (
        <Button type="button" variant="outline" onClick={onRetry}>
          {t("error.retry")}
        </Button>
      ) : null}
    </section>
  );
}
