import { useTranslation } from "react-i18next";

import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import type { EmailTemplateDTO } from "../api";
import { renderSample } from "../format";

interface TemplatePreviewSheetProps {
  template: EmailTemplateDTO | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * @param props - `template` carries the rendered content; `null` closes the sheet.
 * @returns The read-only preview of one template: subject and body rendered with sample values
 * for every declared variable, so unknown placeholders stay visible.
 */
export function TemplatePreviewSheet({ template, open, onOpenChange }: TemplatePreviewSheetProps) {
  const { t } = useTranslation("email");

  return (
    <Sheet open={open && template !== null} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>{t("templates.preview.title")}</SheetTitle>
          <SheetDescription>{t("templates.preview.sampleNote")}</SheetDescription>
        </SheetHeader>
        {template === null ? null : (
          <div className="flex flex-col gap-4 px-4 pb-6">
            <div className="flex flex-col gap-1">
              <span className="text-xs uppercase tracking-wide text-muted-foreground">
                {t("templates.editor.subject")}
              </span>
              <p className="text-sm font-medium">
                {renderSample(template.subject, template.variables)}
              </p>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs uppercase tracking-wide text-muted-foreground">
                {t("templates.editor.body")}
              </span>
              <pre className="whitespace-pre-wrap rounded-md border bg-canvas p-3 font-mono text-xs">
                {renderSample(template.content, template.variables)}
              </pre>
            </div>
            {template.variables.length === 0 ? null : (
              <ul className="flex flex-wrap gap-2" aria-label={t("templates.editor.variables")}>
                {template.variables.map((variable) => (
                  <li key={variable}>
                    <Badge variant="secondary" className="font-mono">
                      {variable}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
