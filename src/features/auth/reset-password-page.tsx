import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Loader2, X } from "lucide-react";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Link, useSearchParams } from "react-router-dom";

import { PasswordInput } from "@/components/password-input";
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

import { passwordRules } from "@/lib/password-rules";

import { useResetPassword } from "./hooks/use-reset-password";
import { resolveResetPasswordError } from "./reset-password-errors";
import {
  type ResetPasswordValues,
  createResetPasswordSchema,
  resetPasswordRuleKeys,
} from "./reset-password-schema";

function PasswordChecklist({ value }: { value: string }) {
  const { t } = useTranslation("auth");
  const rules = passwordRules(value);

  return (
    <div className="space-y-1">
      <p className="text-sm text-muted-foreground">{t("reset.passwordRules.label")}</p>
      <ul className="space-y-1">
        {rules.map(({ id, satisfied }) => (
          <li key={id} className="flex items-start gap-1.5 text-sm">
            {satisfied ? (
              <Check aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-green-600" />
            ) : (
              <X aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-red-500" />
            )}
            <span className={satisfied ? "text-green-600" : "text-muted-foreground"}>
              {t(resetPasswordRuleKeys[id])}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ResetPasswordPage() {
  const { t } = useTranslation("auth");
  const { t: tCommon } = useTranslation();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const schema = useMemo(() => createResetPasswordSchema(t), [t]);

  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(schema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const resetMutation = useResetPassword();
  const errorKey = resolveResetPasswordError(resetMutation.error);
  const invalidToken = token === null || (resetMutation.isError && errorKey !== null);
  const genericError = resetMutation.isError && errorKey === null;
  const passwordValue = form.watch("password");
  const submitPassword = form.handleSubmit((values) => {
    if (token === null) {
      return;
    }
    resetMutation.mutate({ token, newPassword: values.password });
  });

  if (resetMutation.isSuccess) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background p-6">
        <Card className="w-full max-w-[460px]">
          <CardHeader>
            <h1 className="font-display text-2xl font-bold tracking-tight">{t("reset.title")}</h1>
            <output className="mt-2 block text-sm text-muted-foreground">
              {t("reset.success")}
            </output>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link to="/login">{t("reset.backToLogin")}</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  if (invalidToken) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background p-6">
        <Card className="w-full max-w-[460px]">
          <CardHeader>
            <h1 className="font-display text-2xl font-bold tracking-tight">
              {t("reset.invalidTokenTitle")}
            </h1>
            <p role="alert" className="mt-2 text-sm text-muted-foreground">
              {token === null || errorKey !== null
                ? t("reset.errors.invalidToken")
                : t("reset.errors.expiredToken")}
            </p>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link to="/forgot-password">{t("reset.requestNewLink")}</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-6">
      <Card className="w-full max-w-[460px]">
        <CardHeader>
          <h1 className="font-display text-2xl font-bold tracking-tight">{t("reset.title")}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{t("reset.subtitle")}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Form {...form}>
            <form
              onSubmit={(event) => {
                void submitPassword(event);
              }}
              className="space-y-4"
              noValidate
            >
              {genericError ? (
                <Alert variant="destructive" tabIndex={-1}>
                  <AlertDescription>{tCommon("error.genericMessage")}</AlertDescription>
                </Alert>
              ) : null}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("reset.fields.password")}</FormLabel>
                    <FormControl>
                      <PasswordInput
                        showLabel={t("login.showPassword")}
                        hideLabel={t("login.hidePassword")}
                        autoComplete="new-password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <PasswordChecklist value={passwordValue} />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("reset.fields.confirm")}</FormLabel>
                    <FormControl>
                      <PasswordInput
                        showLabel={t("login.showPassword")}
                        hideLabel={t("login.hidePassword")}
                        autoComplete="new-password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={resetMutation.isPending}>
                {resetMutation.isPending ? (
                  <Loader2 aria-hidden="true" className="size-4 animate-spin" />
                ) : null}
                {t("reset.submit")}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </main>
  );
}
