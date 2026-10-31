import { Download } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { DataTable } from "@/components/data-list/data-table";
import { useListParams } from "@/components/data-list/hooks/use-list-params";
import { ListPagination } from "@/components/data-list/list-pagination";
import { ListRefreshButton } from "@/components/data-list/list-refresh-button";
import { ErrorView } from "@/components/error/error-view";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Can } from "@/features/authorization/components/can";
import { PERMISSIONS } from "@/features/authorization/permissions";

import { useUsers } from "./hooks/use-users";
import { RecentAuditCard } from "./recent-audit-card";
import { RolesDistributionCard } from "./roles-distribution-card";
import { useUsersColumns } from "./users-columns";
import { USERS_LIST_PARAMS } from "./users-list-config";
import { SIMULATED_METRICS } from "./users-list-metrics";
import { UsersToolbar } from "./users-toolbar";

const KPIS = [
  { key: "total", labelKey: "list.kpi.total", hintKey: "list.kpi.totalHint" },
  { key: "active", labelKey: "list.kpi.active", hintKey: "list.kpi.activeHint" },
  { key: "blocked", labelKey: "list.kpi.blocked", hintKey: "list.kpi.blockedHint" },
  { key: "unverified", labelKey: "list.kpi.unverified", hintKey: "list.kpi.unverifiedHint" },
] as const;

export function UsersPage() {
  const { t } = useTranslation("users");
  const { t: tCommon } = useTranslation();
  const { params, setFilter, setSort, setPage, setLimit } = useListParams(USERS_LIST_PARAMS);
  const columns = useUsersColumns();
  const users = useUsers(params);

  const rows = users.data?.data ?? [];
  const total = users.data?.total ?? 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-2xl font-semibold tracking-tight">{t("list.title")}</h1>
          <p className="text-sm text-muted-foreground">
            {t("list.subtitle", {
              count: total,
              roles: SIMULATED_METRICS.roles,
              permissions: SIMULATED_METRICS.permissions,
            })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ListRefreshButton
            label={tCommon("ui.list.refresh")}
            onRefresh={() => {
              void users.refetch();
            }}
            isRefreshing={users.isFetching}
          />
          <Button
            type="button"
            variant="outline"
            disabled
            title={`${t("list.exportLabel")} · ${t("list.pendingFeature")}`}
          >
            <Download aria-hidden="true" className="mr-2 h-4 w-4" />
            {t("list.exportLabel")}
          </Button>
          <Can permission={PERMISSIONS.userCreate}>
            <Button type="button" asChild>
              <Link to="/app/users/new">{t("list.actions.create")}</Link>
            </Button>
          </Can>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {KPIS.map((kpi) => (
          <Card key={kpi.key} className="border-panel-border bg-panel text-panel-foreground">
            <CardContent className="flex flex-col gap-2 p-5">
              <span className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-muted-foreground">
                {t(kpi.labelKey)}
              </span>
              <span className="font-display text-2xl font-semibold tabular-nums">
                {kpi.key === "total" ? total.toLocaleString() : "—"}
              </span>
              <span className="text-xs text-muted-foreground">{t(kpi.hintKey)}</span>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Card className="border-panel-border bg-panel text-panel-foreground">
          <CardContent className="flex flex-col gap-4 px-0 pt-6">
            {users.isError ? (
              <ErrorView
                title={tCommon("error.dataFetchTitle")}
                message={tCommon("error.genericMessage")}
                onRetry={() => {
                  void users.refetch();
                }}
              />
            ) : (
              <>
                <div className="px-4">
                  <UsersToolbar
                    role={params.filters.role}
                    onRoleChange={(role) => {
                      setFilter("role", role);
                    }}
                    limit={params.limit}
                    onLimitChange={setLimit}
                  />
                </div>
                <DataTable
                  columns={columns}
                  rows={rows}
                  rowKey={(user) => user.id}
                  caption={t("list.title")}
                  isLoading={users.isPending}
                  sortBy={params.sortBy}
                  sortOrder={params.sortOrder}
                  onSort={setSort}
                  empty={
                    <div className="flex flex-col items-center gap-3 py-8">
                      <p className="text-sm text-muted-foreground">{t("list.empty")}</p>
                      <Can permission={PERMISSIONS.userCreate}>
                        <Button type="button" asChild>
                          <Link to="/app/users/new">{t("list.actions.create")}</Link>
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
                    totalPages={users.data?.totalPages ?? 0}
                    onPageChange={setPage}
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>
        <div className="flex min-w-0 flex-col gap-4">
          <RolesDistributionCard />
          <RecentAuditCard />
        </div>
      </div>
    </div>
  );
}
