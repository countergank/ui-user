import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

import type {
  CreateEmailTemplatePayload,
  EmailTemplateDTO,
  UpdateEmailTemplatePayload,
} from "../api";
import { useCreateEmailTemplate } from "../hooks/use-create-email-template";
import { useUpdateEmailTemplate } from "../hooks/use-update-email-template";
import { type TemplateFormValues, templateFormSchema } from "../template-schema";

const upper = (label: string): string => label.toUpperCase();

interface TemplateEditorDialogProps {
  /** `null` closes the dialog; `"new"` opens it in create mode; a template opens it in edit mode. */
  target: EmailTemplateDTO | "new" | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * @param props - `target` selects create or edit mode and carries the prefill values.
 * @returns The create/edit dialog for one template: identity, active flag, subject, body and the
 * visible list of declared variables. The slug is editable only on create.
 */
export function TemplateEditorDialog({ target, open, onOpenChange }: TemplateEditorDialogProps) {
  const { t } = useTranslation("email");
  const { t: tCommon } = useTranslation();
  const schema = useMemo(() => templateFormSchema(t), [t]);
  const createMutation = useCreateEmailTemplate();
  const updateMutation = useUpdateEmailTemplate();
  const [variables, setVariables] = useState<string[]>([]);
  const [variableDraft, setVariableDraft] = useState("");

  const isEditing = target !== null && target !== "new";
  const editorOpen = open && target !== null;
  const form = useForm<TemplateFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", slug: "", subject: "", body: "", isActive: true },
  });

  useEffect(() => {
    if (!editorOpen) {
      return;
    }
    form.reset(
      target === "new"
        ? { name: "", slug: "", subject: "", body: "", isActive: true }
        : {
            name: target.name,
            slug: target.slug,
            subject: target.subject,
            body: target.content,
            isActive: target.isActive,
          },
    );
    setVariables(target === "new" ? [] : [...target.variables]);
    setVariableDraft("");
  }, [editorOpen, target, form]);

  const addVariable = () => {
    const name = variableDraft.trim();
    if (name === "" || variables.includes(name)) {
      setVariableDraft("");
      return;
    }
    setVariables([...variables, name]);
    setVariableDraft("");
  };

  const removeVariable = (name: string) => {
    setVariables(variables.filter((variable) => variable !== name));
  };

  const pending = createMutation.isPending || updateMutation.isPending;

  const onSubmit = form.handleSubmit((values) => {
    const current = target;
    if (current === null) {
      return;
    }
    if (current !== "new") {
      const payload: UpdateEmailTemplatePayload = {
        name: values.name,
        subject: values.subject,
        content: values.body,
        variables,
        isActive: values.isActive,
      };
      updateMutation.mutate(
        { slug: current.slug, payload },
        {
          onSuccess: () => {
            toast.success(t("templates.success"));
            onOpenChange(false);
          },
          onError: () => {
            toast.error(tCommon("error.genericMessage"));
          },
        },
      );
      return;
    }

    const payload: CreateEmailTemplatePayload = {
      name: values.name,
      slug: values.slug,
      subject: values.subject,
      content: values.body,
      variables,
      isActive: values.isActive,
    };
    createMutation.mutate(payload, {
      onSuccess: () => {
        toast.success(t("templates.success"));
        onOpenChange(false);
      },
      onError: () => {
        toast.error(tCommon("error.genericMessage"));
      },
    });
  });

  return (
    <Dialog open={open && target !== null} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {t(isEditing ? "templates.editor.editTitle" : "templates.editor.createTitle")}
          </DialogTitle>
          <DialogDescription>
            {t("templates.editor.variablesHint", { variable: "nombre" })}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            className="flex flex-col gap-4"
            onSubmit={(event) => void onSubmit(event)}
            noValidate
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("templates.editor.name")}</FormLabel>
                    <FormControl>
                      <Input {...field} autoComplete="off" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("templates.editor.slug")}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        autoComplete="off"
                        disabled={isEditing}
                        className="font-mono"
                      />
                    </FormControl>
                    {isEditing ? null : (
                      <FormDescription>{t("templates.editor.slugHint")}</FormDescription>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{upper(t("templates.editor.subject"))}</FormLabel>
                  <FormControl>
                    <Input {...field} autoComplete="off" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="body"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("templates.editor.body")}</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={10} className="font-mono text-sm" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium">{t("templates.editor.variables")}</span>
              {variables.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  {t("templates.editor.variablesEmpty")}
                </p>
              ) : (
                <ul className="flex flex-wrap gap-2" aria-label={t("templates.editor.variables")}>
                  {variables.map((variable) => (
                    <li key={variable}>
                      <Badge variant="secondary" className="gap-1 font-mono">
                        {variable}
                        <button
                          type="button"
                          aria-label={`${t("templates.actions.delete")}: ${variable}`}
                          onClick={() => {
                            removeVariable(variable);
                          }}
                        >
                          <X aria-hidden="true" className="h-3 w-3" />
                        </button>
                      </Badge>
                    </li>
                  ))}
                </ul>
              )}
              <div className="flex gap-2">
                <Input
                  value={variableDraft}
                  onChange={(event) => {
                    setVariableDraft(event.target.value);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      addVariable();
                    }
                  }}
                  placeholder="userName"
                  className="font-mono"
                  autoComplete="off"
                />
                <Button type="button" variant="outline" onClick={addVariable}>
                  {t("templates.editor.addVariable")}
                </Button>
              </div>
            </div>
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-3">
                  <FormLabel>{t("templates.editor.active")}</FormLabel>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      aria-label={t("templates.editor.active")}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  onOpenChange(false);
                }}
              >
                {t("templates.editor.cancel")}
              </Button>
              <Button type="submit" disabled={pending}>
                {pending ? (
                  <>
                    <Loader2 aria-hidden="true" className="mr-2 h-4 w-4 animate-spin" />
                    {t("templates.editor.saving")}
                  </>
                ) : (
                  t("templates.editor.save")
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
