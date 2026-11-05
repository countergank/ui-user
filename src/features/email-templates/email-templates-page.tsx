import { useState } from "react";
import { useTranslation } from "react-i18next";

import { DataTable } from "@/components/data-list/data-table";
import { useListParams } from "@/components/data-list/hooks/use-list-params";
import { ListPagination } from "@/components/data-list/list-pagination";
import { ListRefreshButton } from "@/components/data-list/list-refresh-button";
import { ErrorView } from "@/components/error/error-view";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Can } from "@/features/authorization/components/can";
import { PERMISSIONS } from "@/features/authorization/permissions";

import type { EmailTemplateDTO } from "./api";
import { TemplateDeleteDialog } from "./components/template-delete-dialog";
import { TemplateEditorDialog } from "./components/template-editor-dialog";
import { TemplatePreviewSheet } from "./components/template-preview-sheet";
import { TemplateTestDialog } from "./components/template-test-dialog";
import { useEmailTemplatesColumns } from "./email-templates-columns";
import { EMAIL_TEMPLATES_LIST_PARAMS } from "./email-templates-list-config";
import { useEmailTemplates } from "./hooks/use-email-templates";

function TemplatesToolbar({
  active,
  onActiveChange,
}: {
  active: string | undefined;
  onActiveChange: (value: string) => void;
}) {
  const { t } = useTranslation("email");

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select
        value={active ?? "all"}
        onValueChange={(value) => {
          onActiveChange(value === "all" ? "" : value);
        }}
      >
        <SelectTrigger className="w-44" aria-label={t("templates.filters.status")}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t("templates.filters.all")}</SelectItem>
          <SelectItem value="true">{t("templates.filters.active")}</SelectItem>
          <SelectItem value="false">{t("templates.filters.inactive")}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

/**
 * @returns The email-templates screen: a table of templates with preview, test-send, edit and
 * delete actions, the status filter, pagination and the create entry point.
 */
export function EmailTemplatesPage() {
  const { t } = useTranslation("email");
  const { t: tCommon } = useTranslation();
  const { params, setFilter, setPage } = useListParams(EMAIL_TEMPLATES_LIST_PARAMS);
  const [editorTarget, setEditorTarget] = useState<EmailTemplateDTO | "new" | null>(null);
  const [previewTarget, setPreviewTarget] = useState<EmailTemplateDTO | null>(null);
  const [testTarget, setTestTarget] = useState<EmailTemplateDTO | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<EmailTemplateDTO | null>(null);
  const columns = useEmailTemplatesColumns({
    onPreview: setPreviewTarget,
    onTest: setTestTarget,
    onEdit: setEditorTarget,
    onDelete: setDeleteTarget,
  });
  const templates = useEmailTemplates(params);

  const rows = templates.data?.data ?? [];
  const total = templates.data?.total ?? 0;
  const dialogsOpen =
    editorTarget !== null || previewTarget !== null || testTarget !== null || deleteTarget !== null;

  return (
    <div className="flex flex-col gap-6" data-dialogs-open={dialogsOpen ? "true" : undefined}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-2xl font-semibold tracking-tight">
            {t("templates.title")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("templates.subtitle", { count: total })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ListRefreshButton
            label={tCommon("ui.list.refresh")}
            onRefresh={() => {
              void templates.refetch();
            }}
            isRefreshing={templates.isFetching}
          />
          <Can permission={PERMISSIONS.emailCreate}>
            <Button
              type="button"
              onClick={() => {
                setEditorTarget("new");
              }}
            >
              {t("templates.actions.create")}
            </Button>
          </Can>
        </div>
      </div>

      <Card className="border-panel-border bg-panel text-panel-foreground">
        <CardContent className="flex flex-col gap-4 px-0 pt-6">
          {templates.isError ? (
            <ErrorView
              title={tCommon("error.dataFetchTitle")}
              message={tCommon("error.genericMessage")}
              onRetry={() => {
                void templates.refetch();
              }}
            />
          ) : (
            <>
              <div className="px-4">
                <TemplatesToolbar
                  active={params.filters.active}
                  onActiveChange={(value) => {
                    setFilter("active", value);
                  }}
                />
              </div>
              <DataTable
                columns={columns}
                rows={rows}
                rowKey={(template) => template.slug}
                caption={t("templates.title")}
                isLoading={templates.isPending}
                empty={
                  <div className="flex flex-col items-center gap-3 py-8">
                    <p className="text-sm text-muted-foreground">{t("templates.empty")}</p>
                    <Can permission={PERMISSIONS.emailCreate}>
                      <Button
                        type="button"
                        onClick={() => {
                          setEditorTarget("new");
                        }}
                      >
                        {t("templates.actions.create")}
                      </Button>
                    </Can>
                  </div>
                }
              />
              <div className="flex justify-end px-4 pb-2">
                <ListPagination
                  page={params.page}
                  limit={params.limit}
                  total={total}
                  totalPages={templates.data?.totalPages ?? 0}
                  onPageChange={setPage}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <TemplateEditorDialog
        target={editorTarget}
        open={editorTarget !== null}
        onOpenChange={(open) => {
          if (!open) {
            setEditorTarget(null);
          }
        }}
      />
      <TemplatePreviewSheet
        template={previewTarget}
        open={previewTarget !== null}
        onOpenChange={(open) => {
          if (!open) {
            setPreviewTarget(null);
          }
        }}
      />
      <TemplateTestDialog
        template={testTarget}
        open={testTarget !== null}
        onOpenChange={(open) => {
          if (!open) {
            setTestTarget(null);
          }
        }}
      />
      <TemplateDeleteDialog
        template={deleteTarget}
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTarget(null);
          }
        }}
      />
    </div>
  );
}
