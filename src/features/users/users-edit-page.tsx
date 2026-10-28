import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { EditUserForm } from "./edit-user-form";
import { useUser } from "./hooks/use-user";

export function UsersEditPage() {
  const { t } = useTranslation("users");
  const { t: tCommon } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const user = useUser(id);

  return (
    <Card className="mx-auto w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="text-2xl">{t("edit.title")}</CardTitle>
      </CardHeader>
      <CardContent>
        {/* biome-ignore lint/a11y/useSemanticElements: intentional status live region, not an <output> */}
        {user.isPending ? <p role="status">{t("edit.loading")}</p> : null}
        {user.isError ? (
          <Alert variant="destructive">
            <AlertDescription>{tCommon("error.genericMessage")}</AlertDescription>
            <Button type="button" variant="outline" size="sm" onClick={() => void user.refetch()}>
              {tCommon("error.retry")}
            </Button>
          </Alert>
        ) : null}
        {user.data ? <EditUserForm user={user.data} /> : null}
      </CardContent>
    </Card>
  );
}
