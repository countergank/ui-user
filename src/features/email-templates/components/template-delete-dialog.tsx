import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import type { EmailTemplateDTO } from "../api";
import { useDeleteEmailTemplate } from "../hooks/use-delete-email-template";

interface TemplateDeleteDialogProps {
  template: EmailTemplateDTO | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * @param props - `template` is the row the confirmation removes; `null` closes the dialog.
 * @returns The delete confirmation for one template; the endpoint answers 204 with no body and
 * a failed delete keeps the dialog open so the action can be retried.
 */
export function TemplateDeleteDialog({ template, open, onOpenChange }: TemplateDeleteDialogProps) {
  const { t } = useTranslation("email");
  const { t: tCommon } = useTranslation();
  const deleteMutation = useDeleteEmailTemplate();

  const onConfirm = () => {
    if (template === null) {
      return;
    }
    deleteMutation.mutate(
      { slug: template.slug },
      {
        onSuccess: () => {
          toast.success(t("templates.deleteSuccess"));
          onOpenChange(false);
        },
        onError: () => {
          toast.error(tCommon("error.genericMessage"));
        },
      },
    );
  };

  return (
    <AlertDialog open={open && template !== null} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("templates.delete.title")}</AlertDialogTitle>
          <AlertDialogDescription>
            {template === null ? null : t("templates.delete.body", { name: template.name })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t("templates.delete.cancel")}</AlertDialogCancel>
          <AlertDialogAction
            disabled={deleteMutation.isPending}
            onClick={(event) => {
              event.preventDefault();
              onConfirm();
            }}
          >
            {deleteMutation.isPending ? (
              <>
                <Loader2 aria-hidden="true" className="mr-2 h-4 w-4 animate-spin" />
                {t("templates.delete.confirm")}
              </>
            ) : (
              t("templates.delete.confirm")
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
