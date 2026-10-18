import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect, useMemo, useRef } from "react";
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

import { useLogin } from "./hooks/use-login";
import { resolveLoginError } from "./login-errors";
import { type LoginValues, createLoginSchema } from "./login-schema";

/**
 * Login form (COU-281, T4 / S3, S6-S10).
 *
 * Three decisions worth naming:
 * - the schema is rebuilt when the translator changes, because its messages are rendered
 *   verbatim as field errors;
 * - every API failure is one form-level `Alert` placed under the form (S6): none of them
 *   is a field validation, so none is attached to a field;
 * - a 429 disables the submit until the component remounts (S8) — the ticket asks for
 *   disabled, not for a countdown, and a countdown would need copy outside S4.
 */
export function LoginForm() {
  const { t } = useTranslation("auth");
  const { t: tCommon } = useTranslation();
  const schema = useMemo(() => createLoginSchema(t), [t]);

  const form = useForm<LoginValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  const loginMutation = useLogin();
  const errorKey = resolveLoginError(loginMutation.error);
  const rateLimited = errorKey === "login.errors.rateLimited";
  // An unenumerated failure still has to be explained, and inventing a key outside S4 is
  // not an option: it falls back to the shared generic message.
  const errorMessage =
    errorKey !== null
      ? t(errorKey)
      : loginMutation.isError
        ? tCommon("error.genericMessage")
        : null;
  const alertRef = useRef<HTMLDivElement>(null);

  // S10: the focus goes to the first error. Field errors are focused by react-hook-form;
  // a form-level error has no field to land on, so the alert takes the focus itself.
  useEffect(() => {
    if (errorMessage !== null) {
      alertRef.current?.focus();
    }
  }, [errorMessage]);

  const onSubmit = form.handleSubmit((values) => {
    loginMutation.mutate(values);
  });

  return (
    <Form {...form}>
      <form
        noValidate
        className="space-y-4"
        onSubmit={(event) => {
          // `handleSubmit` is async; the DOM handler must stay void.
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
                <Input type="password" autoComplete="current-password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          {/* The reset flow is a separate ticket; the link is what S3 asks for. */}
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
