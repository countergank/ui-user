import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { sessionManager } from "@/lib/session/session";
import { selectSessionUser, useSession } from "@/lib/session/session-store";

function initialsOf(name: string | undefined, lastName: string | undefined): string {
  const initials = `${name?.[0] ?? ""}${lastName?.[0] ?? ""}`.trim();

  return initials === "" ? "?" : initials.toUpperCase();
}

/**
 * The topbar's user menu (COU-278, T5 / S1). Logout is **local-first**: the store, the
 * persisted session and the query cache are emptied before the network call (COU-273, S6),
 * so navigating to `/login` never depends on the API answering.
 */
export function UserMenu() {
  const { t } = useTranslation("console");
  const user = useSession(selectSessionUser);
  const navigate = useNavigate();

  const signOut = (): void => {
    void sessionManager.logout();
    void navigate("/login", { replace: true });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="rounded-full"
          aria-label={t("shell.userMenu")}
          title={t("shell.userMenu")}
        >
          <Avatar className="h-8 w-8">
            <AvatarFallback>{initialsOf(user?.name, user?.lastName)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {user ? (
          <>
            <DropdownMenuLabel className="truncate">{user.email}</DropdownMenuLabel>
            <DropdownMenuSeparator />
          </>
        ) : null}
        <DropdownMenuItem asChild>
          <Link to="/profile">{t("shell.profile")}</Link>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={signOut}>{t("shell.signOut")}</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
