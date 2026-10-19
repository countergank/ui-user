import { Terminal } from "lucide-react";
import { useTranslation } from "react-i18next";

/**
 * Quickstart block (COU-310, T10 / S13).
 *
 * A command is code, not copy: it is rendered verbatim from the bundle and never
 * translated, and it carries its own accessible label so a screen reader announces what
 * the block is instead of a bare line of text.
 */
export function Quickstart() {
  const { t } = useTranslation("landing");

  return (
    <div className="flex flex-col gap-3">
      <p className="max-w-prose text-muted-foreground">{t("quickstart.body")}</p>
      <div className="w-full max-w-prose overflow-hidden rounded-lg border bg-muted/60">
        <div className="flex items-center gap-2 border-b px-4 py-2 text-xs text-muted-foreground">
          <Terminal aria-hidden="true" className="size-3.5" />
          <span>{t("quickstart.terminalLabel")}</span>
        </div>
        <pre
          className="overflow-x-auto px-4 py-3 text-sm"
          aria-label={t("quickstart.terminalLabel")}
        >
          <code>{t("quickstart.command")}</code>
        </pre>
      </div>
      <p className="max-w-prose text-sm text-muted-foreground">{t("quickstart.note")}</p>
    </div>
  );
}
