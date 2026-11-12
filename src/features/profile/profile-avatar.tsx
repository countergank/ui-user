import { Pencil } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { Avatar, AvatarBadge, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { avatarSrcOf } from "@/lib/avatar";
import { selectSessionUser, useSession } from "@/lib/session/session-store";

import { ProfilePhotoDialog } from "./profile-photo-dialog";

function initialsOf(name: string | undefined, lastName: string | undefined): string {
  const initials = `${name?.[0] ?? ""}${lastName?.[0] ?? ""}`.trim();

  return initials === "" ? "?" : initials.toUpperCase();
}

/**
 * @returns The profile identity block: a 56px avatar showing the session photo when one exists
 * or the initials otherwise, with a pencil button that opens the photo upload dialog.
 */
export function ProfileAvatar() {
  const { t } = useTranslation("profile");
  const user = useSession(selectSessionUser);
  const [open, setOpen] = useState(false);

  return (
    <>
      <Avatar className="size-14" data-testid="profile-avatar">
        {user?.avatarUrl === undefined || user.avatarUrl === null ? null : (
          <AvatarImage
            src={avatarSrcOf(user.avatarUrl)}
            alt=""
            data-testid="profile-avatar-image"
          />
        )}
        <AvatarFallback className="bg-primary text-[18px] font-bold text-primary-foreground">
          {initialsOf(user?.name, user?.lastName)}
        </AvatarFallback>
        <AvatarBadge className="size-5">
          <button
            type="button"
            aria-label={t("actions.changePhoto")}
            className="flex size-full cursor-pointer items-center justify-center rounded-full bg-primary text-primary-foreground transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            onClick={() => {
              setOpen(true);
            }}
          >
            <Pencil className="size-3" aria-hidden="true" />
          </button>
        </AvatarBadge>
      </Avatar>
      <ProfilePhotoDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
