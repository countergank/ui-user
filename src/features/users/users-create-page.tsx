import { useTranslation } from "react-i18next";

import { Card, CardContent } from "@/components/ui/card";

import { CreateUserForm } from "./create-user-form";

export function UsersCreatePage() {
  const { t } = useTranslation("users");

  return (
    <div className="flex w-full flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="font-display text-[26px] font-bold tracking-tight">{t("create.title")}</h1>
        <p className="text-[13px] text-muted-foreground">{t("create.subtitle")}</p>
      </header>
      <Card className="w-full max-w-2xl border-panel-border bg-panel text-panel-foreground">
        <CardContent className="pt-6">
          <CreateUserForm />
        </CardContent>
      </Card>
    </div>
  );
}
