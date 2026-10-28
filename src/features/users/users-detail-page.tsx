import { ArrowLeft, Pencil } from "lucide-react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";

import { ErrorView } from "@/components/error/error-view";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Can } from "@/features/authorization/components/can";
import { PERMISSIONS } from "@/features/authorization/permissions";
import { AppError } from "@/lib/errors";

import { useUser } from "./hooks/use-user";

const NO_VALUE = "—";
const USERS_PATH = "/app/users";

function formatDate(value: string, language: string): string {
  return new Intl.DateTimeFormat(language, { dateStyle: "medium" }).format(new Date(value));
}

function DetailField({ term, children }: { term: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1 border-b border-border/60 py-3 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
      <dt className="text-sm text-muted-foreground">{term}</dt>
      <dd className="text-sm font-medium">{children}</dd>
    </div>
  );
}

/**
 * @returns The read-only user detail for the `:id` route param: every `UserDTO` field, the lock
 * state, an edit shortcut for `user:update` holders, and a dedicated view when the API answers 404.
 */
export function UsersDetailPage() {
  const { t, i18n } = useTranslation("users");
  const { t: tCommon } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const user = useUser(id);
  const notFound = user.error instanceof AppError && user.error.status === 404;

  return (
    <Card className="mx-auto w-full max-w-2xl">
      <CardHeader>
        <h1 className="text-2xl font-semibold leading-none tracking-tight">{t("detail.title")}</h1>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {user.isPending ? <output>{t("detail.loading")}</output> : null}
        {notFound ? (
          <section className="flex flex-col items-start gap-3">
            <h2 className="text-xl font-semibold text-destructive">{t("detail.notFound")}</h2>
            <Button asChild variant="outline" size="sm">
              <Link to={USERS_PATH}>
                <ArrowLeft aria-hidden="true" />
                {t("detail.back")}
              </Link>
            </Button>
          </section>
        ) : null}
        {user.isError && !notFound ? (
          <ErrorView
            title={tCommon("error.dataFetchTitle")}
            message={tCommon("error.genericMessage")}
            onRetry={() => {
              void user.refetch();
            }}
          />
        ) : null}
        {user.data ? (
          <>
            <div className="flex items-center justify-between gap-2">
              <Button asChild variant="ghost" size="sm" className="-ml-3">
                <Link to={USERS_PATH}>
                  <ArrowLeft aria-hidden="true" />
                  {t("detail.back")}
                </Link>
              </Button>
              <Can permission={PERMISSIONS.userUpdate}>
                <Button asChild size="sm">
                  <Link to={`${USERS_PATH}/${encodeURIComponent(user.data.id)}/edit`}>
                    <Pencil aria-hidden="true" />
                    {t("detail.actions.edit")}
                  </Link>
                </Button>
              </Can>
            </div>
            <dl className="flex flex-col">
              <DetailField term={t("detail.fields.id")}>{user.data.id}</DetailField>
              <DetailField term={t("detail.fields.name")}>{user.data.name}</DetailField>
              <DetailField term={t("detail.fields.lastName")}>{user.data.lastName}</DetailField>
              <DetailField term={t("detail.fields.email")}>{user.data.email}</DetailField>
              <DetailField term={t("detail.fields.userName")}>{user.data.userName}</DetailField>
              <DetailField term={t("detail.fields.role")}>
                <Badge variant="secondary">{user.data.role}</Badge>
              </DetailField>
              <DetailField term={t("detail.fields.status")}>
                <Badge variant={user.data.isActive ? "default" : "outline"}>
                  {t(user.data.isActive ? "list.status.active" : "list.status.inactive")}
                </Badge>
              </DetailField>
              <DetailField term={t("detail.fields.createdAt")}>
                {formatDate(user.data.createdAt, i18n.language)}
              </DetailField>
              <DetailField term={t("detail.fields.updatedAt")}>
                {formatDate(user.data.updatedAt, i18n.language)}
              </DetailField>
              <DetailField term={t("detail.locked")}>
                {user.data.lockedUntil === null
                  ? NO_VALUE
                  : formatDate(user.data.lockedUntil, i18n.language)}
              </DetailField>
              <DetailField term={t("detail.failedAttempts")}>
                {String(user.data.failedLoginAttempts)}
              </DetailField>
            </dl>
          </>
        ) : null}
      </CardContent>
    </Card>
  );
}
