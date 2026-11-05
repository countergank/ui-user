import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import type { EmailTemplateDTO } from "../api";
import { sampleVariablesOf } from "../format";
import { useSendTestEmail } from "../hooks/use-send-test-email";
import { type TestEmailFormValues, testEmailFormSchema } from "../template-schema";

interface TemplateTestDialogProps {
  template: EmailTemplateDTO | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * @param props - `template` selects the template sent as `useCase` with sample variable values.
 * @returns The test-send dialog: one recipient, rendered with sample data, with clear success
 * and error feedback. A failed send keeps the dialog open so the address can be corrected.
 */
export function TemplateTestDialog({ template, open, onOpenChange }: TemplateTestDialogProps) {
  const { t } = useTranslation("email");
  const { t: tCommon } = useTranslation();
  const schema = useMemo(() => testEmailFormSchema(t), [t]);
  const sendMutation = useSendTestEmail();
  const form = useForm<TestEmailFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { to: "" },
  });

  useEffect(() => {
    if (open) {
      form.reset({ to: "" });
    }
  }, [open, form]);

  const onSubmit = form.handleSubmit((values) => {
    if (template === null) {
      return;
    }
    sendMutation.mutate(
      {
        useCase: template.slug,
        to: values.to,
        variables: sampleVariablesOf(template.variables),
      },
      {
        onSuccess: () => {
          toast.success(t("templates.test.success", { to: values.to }));
          onOpenChange(false);
        },
        onError: () => {
          toast.error(tCommon("error.genericMessage"));
        },
      },
    );
  });

  return (
    <Dialog open={open && template !== null} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("templates.test.title")}</DialogTitle>
          <DialogDescription>{t("templates.test.description")}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            className="flex flex-col gap-4"
            onSubmit={(event) => void onSubmit(event)}
            noValidate
          >
            <FormField
              control={form.control}
              name="to"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("templates.test.to")}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      placeholder={t("templates.test.toPlaceholder")}
                    />
                  </FormControl>
                  <FormMessage />
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
              <Button type="submit" disabled={sendMutation.isPending}>
                {sendMutation.isPending ? (
                  <>
                    <Loader2 aria-hidden="true" className="mr-2 h-4 w-4 animate-spin" />
                    {t("templates.test.sending")}
                  </>
                ) : (
                  t("templates.test.send")
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
