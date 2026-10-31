import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import type { UpdateUserPayload } from "./api";
import { UserFormField, userControlClass } from "./components/user-form-field";
import { resolveCreateUserError } from "./create-user-errors";
import { type EditUserInput, type EditUserValues, editUserFormSchema } from "./edit-schema";
import { useUpdateUser } from "./hooks/use-update-user";
import { USER_ROLES } from "./types";
import type { UserDTO, UserRoleName } from "./types";

const EDITABLE_FIELDS = ["name", "lastName", "email", "userName", "role"] as const;

/**
 * @param user - the prefill user fetched with `useUser`; the form compares every change against
 * these values, so save stays disabled while nothing differs.
 * @returns The edit-user form: prefilled identity fields and role, an impact notice while the
 * role differs from the loaded one, and a PATCH that sends only the changed fields.
 */
export function EditUserForm({ user }: { user: UserDTO }) {
  const { t } = useTranslation("users");
  const { t: tCommon } = useTranslation();
  const schema = useMemo(() => editUserFormSchema(t), [t]);
  const navigate = useNavigate();
  const updateMutation = useUpdateUser(user.id);
  const [formError, setFormError] = useState<string | null>(null);
  const alertRef = useRef<HTMLDivElement>(null);

  const original = useMemo(
    () => ({
      name: user.name,
      lastName: user.lastName,
      email: user.email,
      userName: user.userName,
      role: user.role as UserRoleName,
    }),
    [user],
  );

  const form = useForm<EditUserInput, unknown, EditUserValues>({
    resolver: zodResolver(schema),
    defaultValues: original,
  });

  const watched = form.watch();
  const isDirty = EDITABLE_FIELDS.some((field) => watched[field] !== original[field]);
  const roleChanged = watched.role !== original.role;

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
    const payload: UpdateUserPayload = {};
    if (values.name !== original.name) payload.name = values.name;
    if (values.lastName !== original.lastName) payload.lastName = values.lastName;
    if (values.email !== original.email) payload.email = values.email;
    if (values.userName !== original.userName) payload.userName = values.userName;
    if (values.role !== original.role) payload.role = values.role;

    if (Object.keys(payload).length === 0) {
      return;
    }

    updateMutation.mutate(payload, {
      onSuccess: () => {
        toast.success(t("edit.success"));
        void navigate("/app/users");
      },
      onError: (error) => {
        const mapped = resolveCreateUserError(error);
        if (mapped === null || mapped.field === "password") {
          setFormError(tCommon("error.genericMessage"));
          return;
        }
        form.setError(mapped.field, { message: t(mapped.messageKey) });
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
        <fieldset className="space-y-4">
          <legend className="text-sm font-medium text-panel-foreground">
            {t("edit.groups.identity")}
          </legend>
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <UserFormField label={t("edit.fields.name")}>
                <FormControl>
                  <Input autoComplete="given-name" className={userControlClass} {...field} />
                </FormControl>
              </UserFormField>
            )}
          />
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <UserFormField label={t("edit.fields.lastName")}>
                <FormControl>
                  <Input autoComplete="family-name" className={userControlClass} {...field} />
                </FormControl>
              </UserFormField>
            )}
          />
        </fieldset>

        <fieldset className="space-y-4">
          <legend className="text-sm font-medium text-panel-foreground">
            {t("edit.groups.access")}
          </legend>
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <UserFormField label={t("edit.fields.email")}>
                <FormControl>
                  <Input
                    type="email"
                    autoComplete="email"
                    className={userControlClass}
                    {...field}
                  />
                </FormControl>
              </UserFormField>
            )}
          />
          <FormField
            control={form.control}
            name="userName"
            render={({ field }) => (
              <UserFormField label={t("edit.fields.userName")}>
                <FormControl>
                  <Input autoComplete="username" className={userControlClass} {...field} />
                </FormControl>
              </UserFormField>
            )}
          />
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <UserFormField
                label={t("edit.fields.role")}
                after={
                  roleChanged ? (
                    // biome-ignore lint/a11y/useSemanticElements: intentional status live region, not an <output>
                    <Alert role="status" className="border-border bg-muted/50">
                      <AlertDescription>{t("edit.roleImpact")}</AlertDescription>
                    </Alert>
                  ) : null
                }
              >
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className={userControlClass}>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {USER_ROLES.map((role) => (
                      <SelectItem key={role} value={role}>
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </UserFormField>
            )}
          />
        </fieldset>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" asChild>
            <Link to="/app/users">{t("edit.cancel")}</Link>
          </Button>
          <Button
            type="submit"
            disabled={!isDirty || updateMutation.isPending}
            aria-busy={updateMutation.isPending}
          >
            {updateMutation.isPending ? (
              <Loader2 className="animate-spin" aria-hidden="true" />
            ) : null}
            {t("edit.submit")}
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
