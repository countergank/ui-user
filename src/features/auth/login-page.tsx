import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { Alert, AlertDescription } from "@/components/ui/alert";

import { LoginBrandPanel } from "./components/login-brand-panel";
import { LoginForm } from "./login-form";
import { TwoFactorChallengeForm } from "./two-factor-challenge-form";

interface PendingChallenge {
  challengeToken: string;
  destination: string;
}

export function LoginPage() {
  const { t } = useTranslation("auth");
  const [challenge, setChallenge] = useState<PendingChallenge | null>(null);
  const [challengeExpired, setChallengeExpired] = useState(false);

  const noticeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (challengeExpired) {
      noticeRef.current?.focus();
    }
  }, [challengeExpired]);

  return (
    <main className="grid min-h-screen bg-background lg:grid-cols-[43%_57%]">
      <div className="flex flex-col p-6 sm:p-10 lg:p-16">
        <div className="flex items-center gap-2.5">
          <span
            aria-hidden="true"
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary font-mono text-xs font-bold text-primary-foreground"
          >
            CG
          </span>
          <span className="font-display text-sm font-bold uppercase tracking-wide text-foreground">
            Countergank
          </span>
        </div>
        <div className="mx-auto flex w-full max-w-[460px] flex-1 flex-col justify-center py-12 lg:mx-0 lg:max-w-none">
          {challenge === null ? (
            <>
              <h1 className="font-display text-3xl font-bold tracking-tight">{t("login.title")}</h1>
              <p className="mt-2 text-sm text-muted-foreground">{t("login.subtitle")}</p>
              <div className="mt-8 max-w-[460px]">
                {challengeExpired ? (
                  <Alert ref={noticeRef} tabIndex={-1} className="mb-6">
                    <AlertDescription>{t("challenge.expiredNotice")}</AlertDescription>
                  </Alert>
                ) : null}
                <LoginForm
                  onTwoFactorChallenge={(challengeToken, destination) => {
                    setChallengeExpired(false);
                    setChallenge({ challengeToken, destination });
                  }}
                />
              </div>
            </>
          ) : (
            <>
              <h1 className="font-display text-3xl font-bold tracking-tight">
                {t("challenge.title")}
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">{t("challenge.subtitle")}</p>
              <div className="mt-8 max-w-[460px]">
                <TwoFactorChallengeForm
                  challengeToken={challenge.challengeToken}
                  destination={challenge.destination}
                  onChallengeExpired={() => {
                    setChallenge(null);
                    setChallengeExpired(true);
                  }}
                />
              </div>
            </>
          )}
        </div>
        <div className="flex items-center justify-between gap-4 text-xs text-muted-foreground">
          <span>{t("login.footer.copyright", { year: 2026 })}</span>
          <Link to="/" className="underline-offset-4 hover:underline">
            {t("login.footer.backToSite")}
          </Link>
        </div>
      </div>
      <LoginBrandPanel />
    </main>
  );
}
