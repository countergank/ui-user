import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
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
import { resolveApiErrorPresentation } from "@/lib/errors/resolve";
import { sessionStore } from "@/lib/session/session-store";

import type { UpdateProfilePayload } from "./api";
import { useUpdateProfile } from "./hooks/use-profile";
import { type ProfileFormInput, type ProfileFormValues, profileFormSchema } from "./profile-schema";
import type { ProfileDTO } from "./types";

const EDITABLE_FIELDS = ["name", "lastName"] as const;

/**
 * @param profile - the prefill profile fetched with `useProfile`; the form compares every
 * change against these values, so save stays disabled while nothing differs. The email is
 * rendered read-only and never patched.
 * @returns The profile form: prefilled name and last name, a diff-only PATCH, a success toast
 * that also refreshes the session user (sidebar and topbar reflect the new name), and a
 * form-level error alert built from the i18n error catalog — never the backend message.
 */
export function ProfileForm({ profile }: { profile: ProfileDTO }) {
  const { t } = useTranslation("profile");
  const { t: tCommon } = useTranslation();
  const schema = useMemo(() => profileFormSchema(t), [t]);
  const updateMutation = useUpdateProfile();
  const [formError, setFormError] = useState<string | null>(null);
  const alertRef = useRef<HTMLDivElement>(null);

  const original = useMemo(() => ({ name: profile.name, lastName: profile.lastName }), [profile]);

  const form = useForm<ProfileFormInput, unknown, ProfileFormValues>({
    resolver: zodResolver(schema),
    defaultValues: original,
  });

  const watched = form.watch();
  const isDirty = EDITABLE_FIELDS.some((field) => watched[field] !== original[field]);

  useEffect(() => {
    if (formError !== null) {
      alertRef.current?.focus();
    }
  }, [formError]);

  const onSubmit = form.handleSubmit((values) => {
    if (updateMutation.isPending) {
      return;
    }

    setFormError(null);
    const payload: UpdateProfilePayload = {};
    if (values.name !== original.name) payload.name = values.name;
    if (values.lastName !== original.lastName) payload.lastName = values.lastName;

    if (Object.keys(payload).length === 0) {
      return;
    }

    updateMutation.mutate(payload, {
      onSuccess: (updated) => {
        sessionStore
          .getState()
          .updateSessionUser({ name: updated.name, lastName: updated.lastName });
        form.reset({ name: updated.name, lastName: updated.lastName });
        toast.success(t("success.updated"));
      },
      onError: (error) => {
        toast.error(t("errors.saveFailure"));
        const { messageKey } = resolveApiErrorPresentation(error);
        setFormError(tCommon(messageKey));
      },
    });
  });

  return (
    <Form {...form}>
      <form
        noValidate
        className="space-y-6"
        onSubmit={(event) => {
          void onSubmit(event);
        }}
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("fields.name")}</FormLabel>
              <FormControl>
                <Input autoComplete="given-name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="lastName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("fields.lastName")}</FormLabel>
              <FormControl>
                <Input autoComplete="family-name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="space-y-2">
          <Label htmlFor="profile-email">{t("fields.email")}</Label>
          <div className="flex items-center gap-3">
            <Input
              id="profile-email"
              type="email"
              autoComplete="email"
              className="flex-1"
              value={profile.email}
              readOnly
              disabled
            />
            <Badge variant="secondary">{t("fields.readOnly")}</Badge>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            className="h-8 px-3"
            onClick={() => {
              form.reset();
            }}
          >
            {t("actions.cancel")}
          </Button>
          <Button
            type="submit"
            className="h-8 px-3"
            disabled={!isDirty || updateMutation.isPending}
            aria-busy={updateMutation.isPending}
          >
            {updateMutation.isPending ? (
              <Loader2 className="animate-spin" aria-hidden="true" />
            ) : null}
            {t("actions.save")}
          </Button>
        </div>

        {formError !== null ? (
          <Alert ref={alertRef} tabIndex={-1} variant="destructive">
            <AlertDescription>{formError}</AlertDescription>
          </Alert>
        ) : null}
      </form>
    </Form>
  );
}
