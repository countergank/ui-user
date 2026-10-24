import { DataTable } from "@/components/data-list/data-table";
import { useListParams } from "@/components/data-list/hooks/use-list-params";
import { ListFilters } from "@/components/data-list/list-filters";
import { ListPagination } from "@/components/data-list/list-pagination";
import { ListRefreshButton } from "@/components/data-list/list-refresh-button";
import { ErrorView } from "@/components/error/error-view";
import { Button } from "@/components/ui/button";
import { Can } from "@/features/authorization/components/can";
import { PERMISSIONS } from "@/features/authorization/permissions";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { useUsers } from "./hooks/use-users";
import { USER_ROLES } from "./types";
import { useUsersColumns } from "./users-columns";
import { USERS_LIST_PARAMS } from "./users-list-config";

export function UsersPage() {
  const { t } = useTranslation("users");
  const { t: tCommon } = useTranslation();
  const { params, setFilter, setSort, setPage, clearFilters } = useListParams(USERS_LIST_PARAMS);
  const columns = useUsersColumns();
  const users = useUsers(params);

  const rows = users.data?.data ?? [];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-2xl">{t("list.title")}</CardTitle>
        <div className="flex items-center gap-2">
          <ListRefreshButton
            label={tCommon("ui.list.refresh")}
            onRefresh={() => {
              void users.refetch();
            }}
            isRefreshing={users.isFetching}
          />
          <Can permission={PERMISSIONS.userCreate}>
            <Button type="button" asChild>
              <Link to="/app/users/new">{t("list.actions.create")}</Link>
            </Button>
          </Can>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
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
            <ListFilters
              searchValue={params.filters.search ?? ""}
              searchLabel={t("list.filters.search")}
              onSearchChange={(value) => {
                setFilter("search", value === "" ? null : value);
              }}
              selectFilters={[
                {
                  name: "role",
                  label: t("list.filters.role"),
                  value: params.filters.role ?? "",
                  options: USER_ROLES.map((role) => ({
                    value: role,
                    label: role,
                  })),
                  onChange: (value) => {
                    setFilter("role", value === "" ? null : value);
                  },
                },
                {
                  name: "isActive",
                  label: t("list.filters.status"),
                  value: params.filters.isActive ?? "",
                  options: [
                    { value: "true", label: t("list.status.active") },
                    { value: "false", label: t("list.status.inactive") },
                  ],
                  onChange: (value) => {
                    setFilter("isActive", value === "" ? null : value);
                  },
                },
              ]}
              clearLabel={t("list.filters.clear")}
              onClear={clearFilters}
            />
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
            <ListPagination
              page={params.page}
              limit={params.limit}
              total={users.data?.total ?? 0}
              totalPages={users.data?.totalPages ?? 0}
              onPageChange={setPage}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
}
