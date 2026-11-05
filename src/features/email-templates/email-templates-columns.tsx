import type { DataTableColumn } from "@/components/data-list/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Can } from "@/features/authorization/components/can";
import { PERMISSIONS } from "@/features/authorization/permissions";
import { Eye, Pencil, Send, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";

import type { EmailTemplateDTO } from "./api";
import { formatDate } from "./format";

const upper = (label: string): string => label.toUpperCase();

export interface TemplateActionHandlers {
  onPreview: (template: EmailTemplateDTO) => void;
  onTest: (template: EmailTemplateDTO) => void;
  onEdit: (template: EmailTemplateDTO) => void;
  onDelete: (template: EmailTemplateDTO) => void;
}

export function useEmailTemplatesColumns(
  handlers: TemplateActionHandlers,
): DataTableColumn<EmailTemplateDTO>[] {
  const { t, i18n } = useTranslation("email");

  return [
    {
      key: "name",
      header: upper(t("templates.columns.name")),
      cell: (template) => (
        <div className="flex min-w-0 flex-col">
          <span className="truncate text-sm font-medium">{template.name}</span>
          <span className="truncate font-mono text-xs text-muted-foreground">{template.slug}</span>
        </div>
      ),
    },
    {
      key: "subject",
      header: upper(t("templates.columns.subject")),
      cell: (template) => (
        <span className="block max-w-64 truncate text-sm">{template.subject}</span>
      ),
    },
    {
      key: "status",
      header: upper(t("templates.columns.status")),
      cell: (template) => (
        <Badge variant={template.isActive ? "default" : "secondary"}>
          {t(template.isActive ? "templates.status.active" : "templates.status.inactive")}
        </Badge>
      ),
    },
    {
      key: "version",
      header: upper(t("templates.columns.version")),
      cell: (template) => (
        <span className="text-sm tabular-nums text-muted-foreground">v{template.version}</span>
      ),
    },
    {
      key: "updatedAt",
      header: upper(t("templates.columns.updatedAt")),
      cell: (template) => (
        <span className="text-sm text-muted-foreground">
          {formatDate(template.updatedAt, i18n.language)}
        </span>
      ),
    },
    {
      key: "actions",
      header: upper(t("templates.columns.actions")),
      align: "right",
      cell: (template) => (
        <div className="flex justify-end gap-1">
          <Can permission={PERMISSIONS.emailRead}>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="bg-canvas"
              aria-label={t("templates.actions.preview")}
              title={t("templates.actions.preview")}
              onClick={() => {
                handlers.onPreview(template);
              }}
            >
              <Eye aria-hidden="true" />
            </Button>
          </Can>
          <Can permission={PERMISSIONS.emailSend}>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="bg-canvas"
              aria-label={t("templates.actions.test")}
              title={t("templates.actions.test")}
              onClick={() => {
                handlers.onTest(template);
              }}
            >
              <Send aria-hidden="true" />
            </Button>
          </Can>
          <Can permission={PERMISSIONS.emailUpdate}>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="bg-canvas"
              aria-label={t("templates.actions.edit")}
              title={t("templates.actions.edit")}
              onClick={() => {
                handlers.onEdit(template);
              }}
            >
              <Pencil aria-hidden="true" />
            </Button>
          </Can>
          <Can permission={PERMISSIONS.emailDelete}>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="bg-canvas"
              aria-label={t("templates.actions.delete")}
              title={t("templates.actions.delete")}
              onClick={() => {
                handlers.onDelete(template);
              }}
            >
              <Trash2 aria-hidden="true" />
            </Button>
          </Can>
        </div>
      ),
    },
  ];
}
