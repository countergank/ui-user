import { zodResolver } from "@hookform/resolvers/zod";
import type { TFunction } from "i18next";
import { Info, Loader2, MailCheck } from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
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

import { mapEmailChangeError } from "./email-change-errors";
import { useRequestEmailChange, useRequestEmailChangeCode } from "./hooks/use-profile";

const CODE_PATTERN = /^\d{6}$/;

/**
 * @param t - translator bound to the `profile` namespace, so every rule failure carries the
 * localized message instead of a literal.
 * @returns A zod schema for the change-email request: a valid new address that differs
 * from the current one, plus the 6-digit identity code mailed to the current address.
 */
export function emailChangeSchema(t: TFunction<"profile">, currentEmail: string) {
  return z.object({
    newEmail: z
      .string()
      .email(t("email.errors.invalid"))
      .refine((value) => value.toLowerCase() !== currentEmail.toLowerCase(), {
        message: t("email.errors.sameEmail"),
      }),
    code: z.string().refine((value) => CODE_PATTERN.test(value), {
      message: t("email.errors.codeInvalid"),
    }),
  });
}

export type EmailChangeValues = z.output<ReturnType<typeof emailChangeSchema>>;
export type EmailChangeInput = z.input<ReturnType<typeof emailChangeSchema>>;

/**
 * @param currentEmail - the profile's current email, used to reject no-op changes
 * client-side before any network traffic.
 * @returns The change-email section: a card that first mails a 6-digit identity code to
 * the current address, then submits the new address together with that code; a wrong or
 * expired code and an already-taken address both land as field-level errors, and success
 * only means the confirmation email is pending.
 */
export function EmailChangeCard({ currentEmail }: { currentEmail: string }) {
  const { t } = useTranslation("profile");
  const schema = useMemo(() => emailChangeSchema(t, currentEmail), [t, currentEmail]);
  const codeMutation = useRequestEmailChangeCode();
  const requestMutation = useRequestEmailChange();
  const [codeSent, setCodeSent] = useState(false);
  const [successPending, setSuccessPending] = useState(false);

  const form = useForm<EmailChangeInput, unknown, EmailChangeValues>({
    resolver: zodResolver(schema),
    defaultValues: { newEmail: "", code: "" },
  });

  const onSendCode = () => {
    const newEmail = form.getValues("newEmail");
    const parsed = schema.shape.newEmail.safeParse(newEmail);
    if (!parsed.success) {
      form.setError("newEmail", { message: parsed.error.issues[0]?.message ?? "" });
      return;
    }

    if (codeMutation.isPending) {
      return;
    }

    setSuccessPending(false);
    codeMutation.mutate(undefined, {
      onSuccess: () => {
        setCodeSent(true);
        toast.success(t("email.codeSent"));
      },
      onError: () => {
        toast.error(t("email.errors.sendCodeFailure"));
      },
    });
  };

  const onSubmit = form.handleSubmit(
    (values) => {
      if (requestMutation.isPending) {
        return;
      }

      setSuccessPending(false);
      requestMutation.mutate(
        { email: values.newEmail, code: values.code },
        {
          onSuccess: () => {
            form.reset({ newEmail: "", code: "" });
            setCodeSent(false);
            setSuccessPending(true);
            toast.success(t("email.successPending"));
          },
          onError: (error) => {
            const field = mapEmailChangeError(error);
            if (field === "newEmail") {
              form.setError(field, { message: t("email.errors.taken") });
              return;
            }
            if (field === "code") {
              form.setError(field, { message: t("email.errors.codeInvalid") });
              return;
            }
            toast.error(t("errors.saveFailure"));
          },
        },
      );
    },
    () => {
      setSuccessPending(false);
    },
  );

  return (
    <Card className="w-full max-w-2xl border-panel-border bg-panel text-panel-foreground">
      <CardHeader className="space-y-1.5">
        <h3 className="font-semibold leading-none tracking-tight">{t("email.title")}</h3>
        <p className="text-sm text-muted-foreground">{t("email.description")}</p>
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
              name="newEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("email.fields.newEmail")}</FormLabel>
                  <div className="flex items-center gap-2">
                    <FormControl>
                      <Input type="email" autoComplete="email" {...field} />
                    </FormControl>
                    <Button
                      type="button"
                      variant="outline"
                      className="h-10 px-4"
                      disabled={codeMutation.isPending}
                      aria-busy={codeMutation.isPending}
                      onClick={() => {
                        onSendCode();
                      }}
                    >
                      {codeMutation.isPending ? (
                        <Loader2 className="animate-spin" aria-hidden="true" />
                      ) : null}
                      {codeSent ? t("email.actions.resendCode") : t("email.actions.sendCode")}
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("email.fields.code")}</FormLabel>
                  <FormControl>
                    <Input
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={6}
                      className="w-32"
                      disabled={!codeSent}
                      {...field}
                    />
                  </FormControl>
                  <p className="text-sm text-muted-foreground">{t("email.fields.codeHint")}</p>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end">
              <Button
                type="submit"
                className="h-8 px-3"
                disabled={!codeSent || requestMutation.isPending}
                aria-busy={requestMutation.isPending}
              >
                {requestMutation.isPending ? (
                  <Loader2 className="animate-spin" aria-hidden="true" />
                ) : null}
                {t("email.submit")}
              </Button>
            </div>
          </form>
        </Form>
        {codeSent && !successPending ? (
          <Alert className="mt-4">
            <div className="flex items-center gap-2">
              <MailCheck className="size-4 shrink-0" aria-hidden="true" />
              <AlertDescription>{t("email.codeSent")}</AlertDescription>
            </div>
          </Alert>
        ) : null}
        {successPending ? (
          <Alert className="mt-4">
            <div className="flex items-center gap-2">
              <Info className="size-4 shrink-0" aria-hidden="true" />
              <AlertDescription>{t("email.successPending")}</AlertDescription>
            </div>
          </Alert>
        ) : null}
      </CardContent>
    </Card>
  );
}
