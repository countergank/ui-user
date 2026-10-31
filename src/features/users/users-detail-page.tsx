import { ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";

import { ErrorView } from "@/components/error/error-view";
import { Button } from "@/components/ui/button";
import { AppError } from "@/lib/errors";

import { useUser } from "./hooks/use-user";
import { AccountStatusCard } from "./users-detail/account-status-card";
import { ActivityCard } from "./users-detail/activity-card";
import { AdminActionsCard } from "./users-detail/admin-actions-card";
import { DetailHeader } from "./users-detail/detail-header";
import { PermissionsCard } from "./users-detail/permissions-card";
import { ProfileCard } from "./users-detail/profile-card";
import { SessionsCard } from "./users-detail/sessions-card";

const USERS_PATH = "/app/users";

function BackToList() {
  const { t } = useTranslation("users");

  return (
    <Button asChild variant="ghost" size="sm" className="-ml-3 self-start">
      <Link to={USERS_PATH}>
        <ArrowLeft aria-hidden="true" />
        {t("detail.back")}
      </Link>
    </Button>
  );
}

/**
 * @returns The user detail matching the COU-344 artboard: the header with avatar, chips and the
 * edit shortcut for `user:update` holders, plus the `Perfil` and `Sesiones y seguridad` cards fed
 * by `UserDTO`; the sections without an endpoint render `—` placeholders and disabled actions.
 */
export function UsersDetailPage() {
  const { t } = useTranslation("users");
  const { t: tCommon } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const user = useUser(id);
  const notFound = user.error instanceof AppError && user.error.status === 404;

  return (
    <div className="flex w-full flex-col gap-6">
      {user.isPending ? <output>{t("detail.loading")}</output> : null}
      {notFound ? (
        <section className="flex flex-col items-start gap-3">
          <h2 className="text-xl font-semibold text-destructive">{t("detail.notFound")}</h2>
          <BackToList />
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
      {user.data && !notFound ? (
        <>
          <BackToList />
          <DetailHeader user={user.data} />
          <div className="grid gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,3fr)]">
            <div className="flex min-w-0 flex-col gap-6">
              <ProfileCard user={user.data} />
              <PermissionsCard />
              <SessionsCard user={user.data} />
            </div>
            <div className="flex min-w-0 flex-col gap-6">
              <AdminActionsCard />
              <AccountStatusCard />
              <ActivityCard />
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
