import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect, useMemo, useRef } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import { PasswordInput } from "@/components/password-input";
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
import { Label } from "@/components/ui/label";

import { useLogin } from "./hooks/use-login";
import { resolveLoginError } from "./login-errors";
import { type LoginValues, createLoginSchema } from "./login-schema";
import { resolveRedirectTarget } from "./safe-redirect";

export function LoginForm() {
  const { t } = useTranslation("auth");
  const { t: tCommon } = useTranslation();
  const schema = useMemo(() => createLoginSchema(t), [t]);

  const form = useForm<LoginValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const loginMutation = useLogin();
  const errorKey = resolveLoginError(loginMutation.error);
  const rateLimited = errorKey === "login.errors.rateLimited";
  const errorMessage =
    errorKey !== null
      ? t(errorKey)
      : loginMutation.isError
        ? tCommon("error.genericMessage")
        : null;
  const alertRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (errorMessage !== null) {
      alertRef.current?.focus();
    }
  }, [errorMessage]);

  const onSubmit = form.handleSubmit((values) => {
    const destination = resolveRedirectTarget(searchParams);

    loginMutation.mutate(values, {
      onSuccess: () => {
        void navigate(destination, { replace: true });
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
              <FormLabel>{t("login.fields.email")}</FormLabel>
              <FormControl>
                <Input type="email" autoComplete="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("login.fields.password")}</FormLabel>
              <FormControl>
                <PasswordInput
                  showLabel={t("login.showPassword")}
                  hideLabel={t("login.hidePassword")}
                  autoComplete="current-password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <input
              id="login-remember"
              type="checkbox"
              className="h-4 w-4 rounded-sm border border-input bg-background accent-primary"
            />
            <Label htmlFor="login-remember" className="text-sm font-normal text-muted-foreground">
              {t("login.remember")}
            </Label>
          </div>
          <Link
            to="/forgot-password"
            className="text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            {t("login.forgotPassword")}
          </Link>
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={loginMutation.isPending || rateLimited}
          aria-busy={loginMutation.isPending}
        >
          {loginMutation.isPending ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
          {t("login.submit")}
        </Button>

        {errorMessage !== null ? (
          <Alert ref={alertRef} tabIndex={-1} variant="destructive">
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        ) : null}

        <div className="flex items-center gap-3" aria-hidden="true">
          <span className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted-foreground">{t("login.orDivider")}</span>
          <span className="h-px flex-1 bg-border" />
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full"
          disabled
          aria-describedby="login-create-account-hint"
        >
          {t("login.createAccount")}
        </Button>
        <p id="login-create-account-hint" className="sr-only">
          {t("login.createAccountHint")}
        </p>

        <p className="text-center text-xs text-muted-foreground">
          {t("login.legal.prefix")}{" "}
          <button type="button" disabled className="text-primary underline-offset-4">
            {t("login.legal.terms")}
          </button>{" "}
          {t("login.legal.middle")}{" "}
          <button type="button" disabled className="text-primary underline-offset-4">
            {t("login.legal.privacy")}
          </button>
        </p>
      </form>
    </Form>
  );
}
