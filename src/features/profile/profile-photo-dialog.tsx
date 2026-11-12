import { Loader2 } from "lucide-react";
import { type SyntheticEvent, useEffect, useState } from "react";
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
import { Input } from "@/components/ui/input";
import { resolveApiErrorPresentation } from "@/lib/errors/resolve";

import { useUploadProfilePhoto } from "./hooks/use-profile";

const ACCEPTED_FILE_INPUT = "image/jpeg,image/png,image/webp";

interface ProfilePhotoDialogProps {
  /** `false` closes the dialog and resets the selection so reopening starts clean. */
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * @param props - visibility of the dialog, owned by the avatar that opens it.
 * @returns The dialog behind the profile pencil button: one labelled file picker, the
 * uploading state, and typed errors (format, size, or API) surfaced as an inline alert while
 * a success closes with a toast. The upload itself validates in the data layer.
 */
export function ProfilePhotoDialog({ open, onOpenChange }: ProfilePhotoDialogProps) {
  const { t } = useTranslation("profile");
  const { t: tCommon } = useTranslation();
  const upload = useUploadProfilePhoto();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const pending = upload.isPending;

  useEffect(() => {
    if (!open) {
      setSelectedFile(null);
    }
  }, [open]);

  const presentation = upload.error === null ? null : resolveApiErrorPresentation(upload.error);

  const submit = (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (selectedFile === null) {
      return;
    }
    upload.mutate(selectedFile, {
      onSuccess: () => {
        toast.success(t("photo.success"));
        onOpenChange(false);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("photo.title")}</DialogTitle>
          <DialogDescription>{t("photo.description")}</DialogDescription>
        </DialogHeader>
        <form className="flex flex-col gap-4" onSubmit={submit} noValidate>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium" htmlFor="profile-photo-file">
              {t("photo.file")}
            </label>
            <Input
              id="profile-photo-file"
              type="file"
              accept={ACCEPTED_FILE_INPUT}
              disabled={pending}
              onChange={(event) => {
                setSelectedFile(event.target.files?.[0] ?? null);
              }}
            />
            <p className="text-sm text-muted-foreground">
              {selectedFile === null
                ? t("photo.hint")
                : t("photo.selected", { name: selectedFile.name })}
            </p>
          </div>
          {presentation === null ? null : (
            <p
              role="alert"
              data-testid="profile-photo-error"
              className="text-sm font-medium text-destructive"
            >
              {tCommon(presentation.messageKey)}
            </p>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={pending}
              onClick={() => {
                onOpenChange(false);
              }}
            >
              {t("actions.cancel")}
            </Button>
            <Button type="submit" disabled={pending || selectedFile === null}>
              {pending ? (
                <>
                  <Loader2 aria-hidden="true" className="mr-2 h-4 w-4 animate-spin" />
                  {t("photo.uploading")}
                </>
              ) : (
                t("photo.upload")
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
