import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
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
import { resolveApiErrorPresentation } from "@/lib/errors/resolve";

import { useVerifyTwoFactorChallenge } from "./hooks/use-verify-two-factor-challenge";
import {
  type TwoFactorChallengeValues,
  createTwoFactorChallengeSchema,
} from "./two-factor-challenge-schema";

export interface TwoFactorChallengeFormProps {
  challengeToken: string;
  destination: string;
  onChallengeExpired: () => void;
}

export function TwoFactorChallengeForm({
  challengeToken,
  destination,
  onChallengeExpired,
}: TwoFactorChallengeFormProps) {
  const { t } = useTranslation("auth");
  const { t: tCommon } = useTranslation();
  const schema = createTwoFactorChallengeSchema(t);

  const form = useForm<TwoFactorChallengeValues>({
    resolver: zodResolver(schema),
    defaultValues: { code: "" },
  });

  const navigate = useNavigate();
  const verifyMutation = useVerifyTwoFactorChallenge();
  const challengeExpired =
    verifyMutation.error instanceof AppError && verifyMutation.error.code === "UA-AUTH-014";
  const errorMessage =
    verifyMutation.isError && !challengeExpired
      ? tCommon(resolveApiErrorPresentation(verifyMutation.error).messageKey)
      : null;

  const alertRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (challengeExpired) {
      onChallengeExpired();
    }
  }, [challengeExpired, onChallengeExpired]);

  useEffect(() => {
    if (errorMessage !== null) {
      alertRef.current?.focus();
    }
  }, [errorMessage]);

  const onSubmit = form.handleSubmit((values) => {
    verifyMutation.mutate(
      { challengeToken, code: values.code },
      {
        onSuccess: () => {
          void navigate(destination, { replace: true });
        },
      },
    );
  });

  return (
    <Form {...form}>
      <form
        noValidate
        className="space-y-4"
        onSubmit={(event) => {
          void onSubmit(event);
        }}
      >
        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("challenge.fields.code")}</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  placeholder="123456"
                  aria-describedby="challenge-code-hint"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <p id="challenge-code-hint" className="text-xs text-muted-foreground">
          {t("challenge.codeHint")}
        </p>

        <Button
          type="submit"
          className="w-full"
          disabled={verifyMutation.isPending}
          aria-busy={verifyMutation.isPending}
        >
          {verifyMutation.isPending ? (
            <Loader2 className="animate-spin" aria-hidden="true" />
          ) : null}
          {t("challenge.submit")}
        </Button>

        {errorMessage !== null ? (
          <Alert ref={alertRef} tabIndex={-1} variant="destructive">
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        ) : null}
      </form>
    </Form>
  );
}
