import { useTranslation } from "react-i18next";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

import { useProfile } from "./hooks/use-profile";
import { ProfileAvatar } from "./profile-avatar";
import { ProfileForm } from "./profile-form";

/**
 * @returns The `/profile` screen: preloaded current profile in a personal-data card, a
 * read-only email row, dirty-state save/cancel actions and the decorative avatar block.
 */
export function ProfilePage() {
  const { t } = useTranslation("profile");
  const { t: tCommon } = useTranslation();
  const profile = useProfile();

  return (
    <div className="flex w-full flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="font-display text-[26px] font-bold tracking-tight">{t("view.heading")}</h1>
        <p className="text-[13px] text-muted-foreground">{t("view.subtitle")}</p>
      </header>
      <Card className="w-full max-w-2xl border-panel-border bg-panel text-panel-foreground">
        <CardHeader>
          <h2 className="font-semibold leading-none tracking-tight">{t("view.title")}</h2>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          {profile.isPending ? (
            // biome-ignore lint/a11y/useSemanticElements: intentional status live region, not an <output>
            <p role="status">{t("view.loading")}</p>
          ) : null}
          {profile.isError ? (
            <Alert variant="destructive">
              <AlertDescription>{tCommon("error.genericMessage")}</AlertDescription>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  void profile.refetch();
                }}
              >
                {tCommon("error.retry")}
              </Button>
            </Alert>
          ) : null}
          {profile.data ? (
            <>
              <ProfileAvatar />
              <ProfileForm profile={profile.data} />
            </>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
