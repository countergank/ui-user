import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { PasswordInput } from "@/components/password-input";
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

import { UserFormField, userControlClass } from "./components/user-form-field";
import { type CreateUserInput, type CreateUserValues, createUserFormSchema } from "./create-schema";
import { resolveCreateUserError } from "./create-user-errors";
import { useCreateUser } from "./hooks/use-create-user";
import { PasswordStrengthIndicator } from "./password-strength";
import { USER_ROLES } from "./types";

export function CreateUserForm() {
  const { t } = useTranslation("users");
  const { t: tCommon } = useTranslation();
  const schema = useMemo(() => createUserFormSchema(t), [t]);
  const navigate = useNavigate();
  const createMutation = useCreateUser();
  const [formError, setFormError] = useState<string | null>(null);
  const alertRef = useRef<HTMLDivElement>(null);

  const form = useForm<CreateUserInput, unknown, CreateUserValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      lastName: "",
      email: "",
      userName: "",
      password: "",
      confirmPassword: "",
      role: "user",
    },
  });

  useEffect(() => {
    if (formError !== null) {
      alertRef.current?.focus();
    }
  }, [formError]);

  const onSubmit = form.handleSubmit((values) => {
    setFormError(null);
    createMutation.mutate(
      {
        name: values.name,
        lastName: values.lastName,
        email: values.email,
        userName: values.userName,
        password: values.password,
        role: values.role,
      },
      {
        onSuccess: () => {
          toast.success(t("create.success"));
          void navigate("/app/users");
        },
        onError: (error) => {
          const mapped = resolveCreateUserError(error);
          if (mapped === null) {
            setFormError(tCommon("error.genericMessage"));
            return;
          }
          form.setError(mapped.field, { message: t(mapped.messageKey) });
        },
      },
    );
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
            {t("create.groups.identity")}
          </legend>
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <UserFormField label={t("create.fields.name")}>
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
              <UserFormField label={t("create.fields.lastName")}>
                <FormControl>
                  <Input autoComplete="family-name" className={userControlClass} {...field} />
                </FormControl>
              </UserFormField>
            )}
          />
        </fieldset>

        <fieldset className="space-y-4">
          <legend className="text-sm font-medium text-panel-foreground">
            {t("create.groups.access")}
          </legend>
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <UserFormField label={t("create.fields.email")}>
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
              <UserFormField label={t("create.fields.userName")}>
                <FormControl>
                  <Input autoComplete="username" className={userControlClass} {...field} />
                </FormControl>
              </UserFormField>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <UserFormField
                label={t("create.fields.password")}
                after={<PasswordStrengthIndicator control={form.control} t={t} />}
              >
                <FormControl>
                  <PasswordInput
                    showLabel={t("create.showPassword")}
                    hideLabel={t("create.hidePassword")}
                    autoComplete="new-password"
                    className={userControlClass}
                    {...field}
                  />
                </FormControl>
              </UserFormField>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <UserFormField label={t("create.fields.confirmPassword")}>
                <FormControl>
                  <PasswordInput
                    showLabel={t("create.showPassword")}
                    hideLabel={t("create.hidePassword")}
                    autoComplete="new-password"
                    className={userControlClass}
                    {...field}
                  />
                </FormControl>
              </UserFormField>
            )}
          />
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <UserFormField label={t("create.fields.role")}>
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
            <Link to="/app/users">{t("create.cancel")}</Link>
          </Button>
          <Button
            type="submit"
            disabled={createMutation.isPending}
            aria-busy={createMutation.isPending}
          >
            {createMutation.isPending ? (
              <Loader2 className="animate-spin" aria-hidden="true" />
            ) : null}
            {t("create.submit")}
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
