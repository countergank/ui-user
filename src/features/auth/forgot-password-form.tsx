import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

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

import { resolveForgotPasswordError } from "./forgot-password-errors";
import { type ForgotPasswordValues, createForgotPasswordSchema } from "./forgot-password-schema";
import { useForgotPassword } from "./hooks/use-forgot-password";

export function ForgotPasswordForm() {
  const { t } = useTranslation("auth");
  const { t: tCommon } = useTranslation();
  const schema = useMemo(() => createForgotPasswordSchema(t), [t]);
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  const forgotMutation = useForgotPassword();
  const errorKey = resolveForgotPasswordError(forgotMutation.error);
  const rateLimited = errorKey !== null;
  const errorMessage =
    errorKey !== null
      ? t(errorKey)
      : forgotMutation.isError
        ? tCommon("error.genericMessage")
        : null;
  const alertRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (errorMessage !== null) {
      alertRef.current?.focus();
    }
  }, [errorMessage]);

  if (submitted) {
    return (
      <div className="space-y-4">
        {
          // biome-ignore lint/a11y/useSemanticElements: intentional status live region, not an <output>
          <Alert role="status">
            <AlertDescription>{t("forgot.success")}</AlertDescription>
          </Alert>
        }
        <Button asChild variant="outline" className="w-full">
          <Link to="/login">{t("forgot.backToLogin")}</Link>
        </Button>
      </div>
    );
  }

  const onSubmit = form.handleSubmit((values) => {
    forgotMutation.mutate(values.email, {
      onSuccess: () => {
        setSubmitted(true);
      },
    });
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
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("forgot.fields.email")}</FormLabel>
              <FormControl>
                <Input type="email" autoComplete="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full"
          disabled={forgotMutation.isPending || rateLimited}
          aria-busy={forgotMutation.isPending}
        >
          {forgotMutation.isPending ? (
            <Loader2 className="animate-spin" aria-hidden="true" />
          ) : null}
          {t("forgot.submit")}
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
