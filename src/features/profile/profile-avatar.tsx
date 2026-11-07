import { Pencil } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Avatar, AvatarBadge, AvatarFallback } from "@/components/ui/avatar";
import { selectSessionUser, useSession } from "@/lib/session/session-store";

function initialsOf(name: string | undefined, lastName: string | undefined): string {
  const initials = `${name?.[0] ?? ""}${lastName?.[0] ?? ""}`.trim();

  return initials === "" ? "?" : initials.toUpperCase();
}

/**
 * @returns The profile identity block: a 56px avatar with the session initials and a
 * pencil edit button on an `AvatarBadge` (the photo change itself is pending an
 * `api-user` endpoint, spec S15 of odd/tasks/59-mi-perfil.md).
 */
export function ProfileAvatar() {
  const { t } = useTranslation("profile");
  const user = useSession(selectSessionUser);

  return (
    <Avatar className="size-14" data-testid="profile-avatar">
      <AvatarFallback className="bg-primary text-[18px] font-bold text-primary-foreground">
        {initialsOf(user?.name, user?.lastName)}
      </AvatarFallback>
      <AvatarBadge className="size-5">
        <button
          type="button"
          aria-label={t("actions.changePhoto")}
          className="flex size-full cursor-pointer items-center justify-center rounded-full bg-primary text-primary-foreground transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Pencil className="size-3" aria-hidden="true" />
        </button>
      </AvatarBadge>
    </Avatar>
  );
}
