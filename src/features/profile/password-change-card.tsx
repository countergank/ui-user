import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Check, Loader2, X } from "lucide-react";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { PasswordInput } from "@/components/password-input";
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

import { AppError } from "@/lib/errors";
import { passwordRules } from "@/lib/password-rules";

import { changePassword } from "./api";
import {
  type PasswordChangeInput,
  type PasswordChangeValues,
  createPasswordChangeSchema,
  passwordChangeRuleKeys,
} from "./password-change-schema";

const CURRENT_PASSWORD_INCORRECT_CODE = "UA-USR-003";

function isCurrentPasswordIncorrect(error: unknown): boolean {
  return error instanceof AppError && error.code === CURRENT_PASSWORD_INCORRECT_CODE;
}

function PasswordChecklist({ value }: { value: string }) {
  const { t } = useTranslation("profile");
  const rules = passwordRules(value);

  return (
    <div className="space-y-1">
      <p className="text-sm text-muted-foreground">{t("password.rules.label")}</p>
      <ul className="space-y-1">
        {rules.map(({ id, satisfied }) => (
          <li key={id} className="flex items-start gap-1.5 text-sm">
            {satisfied ? (
              <Check aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-green-600" />
            ) : (
              <X aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-red-500" />
            )}
            <span className={satisfied ? "text-green-600" : "text-muted-foreground"}>
              {t(passwordChangeRuleKeys[id])}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * @returns The change-password section: a card with the current, new and confirmation
 * passwords, the live api-rule checklist, a wrong current password surfaced as a field
 * error on the current password only, and a success toast plus form reset on 200.
 */
export function PasswordChangeCard() {
  const { t } = useTranslation("profile");
  const { t: tAuth } = useTranslation("auth");
  const schema = useMemo(() => createPasswordChangeSchema(t), [t]);

  const form = useForm<PasswordChangeInput, unknown, PasswordChangeValues>({
    resolver: zodResolver(schema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  const changeMutation = useMutation({
    mutationFn: ({
      currentPassword,
      newPassword,
    }: {
      currentPassword: string;
      newPassword: string;
    }) => changePassword(currentPassword, newPassword),
  });

  const newPasswordValue = form.watch("newPassword");

  const onSubmit = form.handleSubmit((values) => {
    if (changeMutation.isPending) {
      return;
    }

    changeMutation.mutate(
      { currentPassword: values.currentPassword, newPassword: values.newPassword },
      {
        onSuccess: () => {
          form.reset({ currentPassword: "", newPassword: "", confirmPassword: "" });
          toast.success(t("password.success"));
        },
        onError: (error) => {
          if (isCurrentPasswordIncorrect(error)) {
            form.setError("currentPassword", {
              message: t("password.errors.currentIncorrect"),
            });
            return;
          }
          toast.error(t("password.errors.changeFailure"));
        },
      },
    );
  });

  return (
    <Card className="w-full max-w-2xl border-panel-border bg-panel text-panel-foreground">
      <CardHeader className="space-y-1.5">
        <h3 className="font-semibold leading-none tracking-tight">{t("password.title")}</h3>
        <p className="text-sm text-muted-foreground">{t("password.description")}</p>
      </CardHeader>
      <CardContent>
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
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("password.fields.current")}</FormLabel>
                  <FormControl>
                    <PasswordInput
                      showLabel={tAuth("login.showPassword")}
                      hideLabel={tAuth("login.hidePassword")}
                      autoComplete="current-password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("password.fields.new")}</FormLabel>
                  <FormControl>
                    <PasswordInput
                      showLabel={tAuth("login.showPassword")}
                      hideLabel={tAuth("login.hidePassword")}
                      autoComplete="new-password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <PasswordChecklist value={newPasswordValue} />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("password.fields.confirm")}</FormLabel>
                  <FormControl>
                    <PasswordInput
                      showLabel={tAuth("login.showPassword")}
                      hideLabel={tAuth("login.hidePassword")}
                      autoComplete="new-password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end">
              <Button
                type="submit"
                className="h-10 px-4"
                disabled={changeMutation.isPending}
                aria-busy={changeMutation.isPending}
              >
                {changeMutation.isPending ? (
                  <Loader2 className="animate-spin" aria-hidden="true" />
                ) : null}
                {t("password.submit")}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
