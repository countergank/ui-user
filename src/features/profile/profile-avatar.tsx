import { Pencil } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { Avatar, AvatarBadge, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { avatarSrcOf } from "@/lib/avatar";

import { ProfilePhotoDialog } from "./profile-photo-dialog";
import type { ProfileDTO } from "./types";

function initialsOf(name: string | undefined, lastName: string | undefined): string {
  const initials = `${name?.[0] ?? ""}${lastName?.[0] ?? ""}`.trim();

  return initials === "" ? "?" : initials.toUpperCase();
}

/**
 * @param profile - the freshly loaded profile from `GET /users/profile`.
 * @returns The profile identity block: a 56px avatar showing the profile photo when one
 * exists or the initials otherwise, with a pencil button that opens the photo upload dialog.
 */
export function ProfileAvatar({ profile }: { profile: ProfileDTO }) {
  const { t } = useTranslation("profile");
  const [open, setOpen] = useState(false);

  return (
    <>
      <Avatar className="size-14" data-testid="profile-avatar">
        {profile.avatarUrl === undefined || profile.avatarUrl === null ? null : (
          <AvatarImage
            src={avatarSrcOf(profile.avatarUrl)}
            alt=""
            data-testid="profile-avatar-image"
          />
        )}
        <AvatarFallback className="bg-primary text-[18px] font-bold text-primary-foreground">
          {initialsOf(profile.name, profile.lastName)}
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
