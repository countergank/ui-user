import { zodResolver } from "@hookform/resolvers/zod";
import type { TFunction } from "i18next";
import { Check, Loader2, ShieldCheck, TriangleAlert } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import QRCode from "react-qr-code";
import { z } from "zod";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { AppError } from "@/lib/errors";
import type { ApiErrorMessageKey } from "@/lib/errors/resolve";
import { resolveApiErrorPresentation } from "@/lib/errors/resolve";

import type { TwoFactorEnrollmentDTO } from "./api";
import { useActivateTwoFactor, useEnrollTwoFactor } from "./hooks/use-profile";

const CODE_PATTERN = /^\d{6}$/;

const TWO_FACTOR_NOT_ENROLLED_CODE = "UA-AUTH-012";

/**
 * @param t - translator bound to the `profile` namespace, so the rule failure carries the
 * localized message instead of a literal.
 * @returns A zod schema for the activation step: the 6-digit code the authenticator app
 * currently shows.
 */
export function twoFactorSchema(t: TFunction<"profile">) {
  return z.object({
    code: z.string().refine((value) => CODE_PATTERN.test(value), {
      message: t("twoFactor.errors.codeInvalid"),
    }),
  });
}

export type TwoFactorCodeValues = z.output<ReturnType<typeof twoFactorSchema>>;
export type TwoFactorCodeInput = z.input<ReturnType<typeof twoFactorSchema>>;

/**
 * @returns The two-factor section: a card that starts the TOTP enrollment, renders the QR
 * from the `otpauthUrl` next to the one-time base32 secret with a copy action, and confirms
 * with the 6-digit code. A wrong code stays retryable with its catalog copy; a `UA-AUTH-012`
 * on activation (budget exhausted, enrollment purged) replaces the form with an offer to
 * enroll again, which always yields a fresh secret.
 */
export function TwoFactorCard() {
  const { t } = useTranslation("profile");
  const { t: tCommon } = useTranslation();
  const enrollMutation = useEnrollTwoFactor();
  const activateMutation = useActivateTwoFactor();
  const [enrollment, setEnrollment] = useState<TwoFactorEnrollmentDTO | null>(null);
  const [step, setStep] = useState<"scan" | "confirm">("scan");
  const [activated, setActivated] = useState(false);
  const [enrollmentExpired, setEnrollmentExpired] = useState(false);
  const [activateErrorKey, setActivateErrorKey] = useState<ApiErrorMessageKey | null>(null);
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">("idle");
  const revertTimer = useRef<number | null>(null);
  const mounted = useRef(true);

  const schema = useMemo(() => twoFactorSchema(t), [t]);

  const form = useForm<TwoFactorCodeInput, unknown, TwoFactorCodeValues>({
    resolver: zodResolver(schema),
    defaultValues: { code: "" },
  });

  useEffect(
    () => () => {
      mounted.current = false;
      if (revertTimer.current !== null) {
        window.clearTimeout(revertTimer.current);
      }
    },
    [],
  );

  const enrollPresentation =
    enrollMutation.error === null ? null : resolveApiErrorPresentation(enrollMutation.error);

  const startEnrollment = () => {
    if (enrollMutation.isPending) {
      return;
    }

    setActivated(false);
    setEnrollmentExpired(false);
    setActivateErrorKey(null);
    setStep("scan");
    form.reset({ code: "" });
    enrollMutation.mutate(undefined, {
      onSuccess: (data) => {
        setEnrollment(data);
      },
    });
  };

  const enrolledOnce = useRef(false);
  useEffect(() => {
    if (enrolledOnce.current) {
      return;
    }

    enrolledOnce.current = true;
    startEnrollment();
  });

  const onSubmit = form.handleSubmit((values) => {
    if (activateMutation.isPending) {
      return;
    }

    setActivateErrorKey(null);
    activateMutation.mutate(values.code, {
      onSuccess: () => {
        setActivated(true);
      },
      onError: (error) => {
        if (error instanceof AppError && error.code === TWO_FACTOR_NOT_ENROLLED_CODE) {
          setEnrollmentExpired(true);
          return;
        }
        setActivateErrorKey(resolveApiErrorPresentation(error).messageKey);
      },
    });
  });

  const copySecret = () => {
    if (enrollment === null) {
      return;
    }

    navigator.clipboard
      .writeText(enrollment.secret)
      .then(() => {
        if (!mounted.current) {
          return;
        }
        setCopyState("copied");
        scheduleCopyRevert();
      })
      .catch(() => {
        if (!mounted.current) {
          return;
        }
        setCopyState("failed");
        scheduleCopyRevert();
      });
  };

  const scheduleCopyRevert = () => {
    if (revertTimer.current !== null) {
      window.clearTimeout(revertTimer.current);
    }
    revertTimer.current = window.setTimeout(() => {
      if (mounted.current) {
        setCopyState("idle");
      }
    }, 2000);
  };

  return (
    <Card className="w-full border-panel-border bg-panel text-panel-foreground">
      <CardHeader className="space-y-1.5">
        <h3 className="font-semibold leading-none tracking-tight">{t("twoFactor.title")}</h3>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {activated ? (
          <Alert data-testid="two-factor-activated">
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-4 shrink-0" aria-hidden="true" />
              <AlertDescription>
                <span className="font-medium">{t("twoFactor.activated")}</span>{" "}
                {t("twoFactor.activatedDescription")}
              </AlertDescription>
            </div>
          </Alert>
        ) : enrollment === null ? (
          <>
            {enrollPresentation === null ? (
              <output className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                {t("twoFactor.actions.enrolling")}
              </output>
            ) : (
              <>
                <p
                  role="alert"
                  data-testid="two-factor-enroll-error"
                  className="text-sm font-medium text-destructive"
                >
                  {tCommon(enrollPresentation.messageKey)}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 w-full max-w-md self-center px-4"
                  disabled={enrollMutation.isPending}
                  aria-busy={enrollMutation.isPending}
                  onClick={() => {
                    startEnrollment();
                  }}
                >
                  {enrollMutation.isPending ? (
                    <Loader2 className="animate-spin" aria-hidden="true" />
                  ) : null}
                  {t("twoFactor.actions.retry")}
                </Button>
              </>
            )}
          </>
        ) : enrollmentExpired ? (
          <>
            <Alert variant="destructive">
              <AlertDescription>{tCommon("error.ua.UA-AUTH-012")}</AlertDescription>
            </Alert>
            <p className="text-sm text-muted-foreground">{t("twoFactor.reenrollHint")}</p>
            <div>
              <Button
                type="button"
                className="h-10 px-4"
                disabled={enrollMutation.isPending}
                aria-busy={enrollMutation.isPending}
                onClick={() => {
                  startEnrollment();
                }}
              >
                {enrollMutation.isPending ? (
                  <Loader2 className="animate-spin" aria-hidden="true" />
                ) : null}
                {t("twoFactor.actions.reenroll")}
              </Button>
            </div>
          </>
        ) : (
          <>
            <ol className="flex items-center gap-2" aria-label={t("twoFactor.steps.ariaLabel")}>
              <li
                className="flex items-center gap-2"
                aria-current={step === "scan" ? "step" : undefined}
              >
                <span className="flex size-6 items-center justify-center rounded-full bg-primary font-mono text-xs text-primary-foreground">
                  {step === "confirm" ? <Check className="size-3.5" aria-hidden="true" /> : "1"}
                </span>
                <span className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-muted-foreground">
                  {t("twoFactor.steps.scan")}
                </span>
              </li>
              <li className="h-px flex-1 bg-panel-border" aria-hidden="true" />
              <li
                className="flex items-center gap-2"
                aria-current={step === "confirm" ? "step" : undefined}
              >
                <span
                  className={`flex size-6 items-center justify-center rounded-full border font-mono text-xs ${
                    step === "confirm"
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-panel-border text-muted-foreground"
                  }`}
                >
                  2
                </span>
                <span className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-muted-foreground">
                  {t("twoFactor.steps.confirm")}
                </span>
              </li>
            </ol>
            {step === "scan" ? (
              <div className="flex flex-col items-center gap-4">
                <div
                  role="img"
                  aria-label={t("twoFactor.qrLabel")}
                  data-testid="two-factor-qr"
                  className="rounded-lg border border-panel-border bg-white p-4"
                >
                  <QRCode value={enrollment.otpauthUrl} size={184} aria-hidden="true" />
                </div>
                <div className="flex w-full max-w-md flex-col gap-2">
                  <p className="text-center text-sm text-muted-foreground">
                    {t("twoFactor.qrHint")}
                  </p>
                  <span className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-muted-foreground">
                    {t("twoFactor.secretLabel")}
                  </span>
                  <div className="flex items-stretch gap-2">
                    <code className="min-w-0 flex-1 break-all rounded-md bg-muted px-3 py-2 font-mono text-sm">
                      {enrollment.secret}
                    </code>
                    <Button
                      type="button"
                      variant="outline"
                      className="h-10 shrink-0 px-4"
                      onClick={() => {
                        copySecret();
                      }}
                    >
                      {copyState === "copied"
                        ? t("twoFactor.copied")
                        : copyState === "failed"
                          ? t("twoFactor.copyFailed")
                          : t("twoFactor.copy")}
                    </Button>
                  </div>
                  <p className="flex items-start gap-1.5 text-sm font-medium text-warning">
                    <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                    {t("twoFactor.secretWarning")}
                  </p>
                </div>
                <Button
                  type="button"
                  className="h-10 w-full max-w-md px-4"
                  onClick={() => {
                    setActivateErrorKey(null);
                    setStep("confirm");
                  }}
                >
                  {t("twoFactor.actions.continue")}
                </Button>
              </div>
            ) : (
              <Form {...form}>
                <form
                  noValidate
                  className="mx-auto flex w-full max-w-md flex-col gap-4"
                  onSubmit={(event) => {
                    void onSubmit(event);
                  }}
                >
                  <FormField
                    control={form.control}
                    name="code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("twoFactor.fields.code")}</FormLabel>
                        <FormControl>
                          <Input
                            inputMode="numeric"
                            autoComplete="one-time-code"
                            maxLength={6}
                            className="mx-auto w-40 text-center font-mono text-lg tracking-[0.3em]"
                            {...field}
                          />
                        </FormControl>
                        <p className="text-center text-sm text-muted-foreground">
                          {t("twoFactor.fields.codeHint")}
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="h-10 flex-1 px-4"
                      onClick={() => {
                        setActivateErrorKey(null);
                        setStep("scan");
                      }}
                    >
                      {t("twoFactor.actions.back")}
                    </Button>
                    <Button
                      type="submit"
                      className="h-10 flex-1 px-4"
                      disabled={activateMutation.isPending}
                      aria-busy={activateMutation.isPending}
                    >
                      {activateMutation.isPending ? (
                        <Loader2 className="animate-spin" aria-hidden="true" />
                      ) : null}
                      {activateMutation.isPending
                        ? t("twoFactor.actions.activating")
                        : t("twoFactor.actions.activate")}
                    </Button>
                  </div>
                </form>
              </Form>
            )}
            {activateErrorKey === null ? null : (
              <p
                role="alert"
                data-testid="two-factor-activate-error"
                className="text-sm font-medium text-destructive"
              >
                {tCommon(activateErrorKey)}
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
