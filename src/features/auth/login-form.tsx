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

        <div className="flex justify-end">
          <Link
            to="/forgot-password"
            className="text-sm text-primary underline-offset-4 hover:underline"
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
      </form>
    </Form>
  );
}
