import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";

import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePermissions } from "@/features/authorization/hooks/use-permissions";
import { sessionManager } from "@/lib/session/session";
import { selectSessionUser, useSession } from "@/lib/session/session-store";

function initialsOf(name: string | undefined, lastName: string | undefined): string {
  const initials = `${name?.[0] ?? ""}${lastName?.[0] ?? ""}`.trim();

  return initials === "" ? "?" : initials.toUpperCase();
}

interface UserMenuProps {
  variant?: "icon" | "full";
  ariaLabel?: string;
}

export function UserMenu({ variant = "icon", ariaLabel }: UserMenuProps = {}) {
  const { t } = useTranslation("console");
  const user = useSession(selectSessionUser);
  const { role } = usePermissions();
  const navigate = useNavigate();
  const fullName = [user?.name, user?.lastName].filter(Boolean).join(" ");

  const signOut = (): void => {
    void sessionManager.logout();
    void navigate("/login", { replace: true });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {variant === "full" ? (
          <button
            type="button"
            aria-label={t("shell.userMenu")}
            className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-left transition-colors hover:bg-sidebar-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-highlight"
          >
            <Avatar className="h-9 w-9 shrink-0">
              <span className="flex h-full w-full items-center justify-center rounded-full bg-sidebar-accent text-[11px] font-bold text-sidebar-highlight">
                {initialsOf(user?.name, user?.lastName)}
              </span>
            </Avatar>
            <span className="flex min-w-0 flex-col gap-px">
              <span className="truncate text-[12.5px] font-medium leading-tight text-sidebar-foreground">
                {fullName}
              </span>
              {role === null ? null : (
                <span className="truncate font-mono text-[9.5px] uppercase tracking-[0.08em] text-sidebar-faint">
                  {role}
                </span>
              )}
            </span>
          </button>
        ) : (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full focus-visible:!ring-avatar-ring"
            aria-label={ariaLabel ?? t("shell.userMenu")}
            title={ariaLabel ?? t("shell.userMenu")}
          >
            <Avatar className="h-8 w-8">
              <span className="flex h-full w-full items-center justify-center rounded-full bg-avatar text-[11px] font-bold text-accent-foreground">
                {initialsOf(user?.name, user?.lastName)}
              </span>
            </Avatar>
          </Button>
        )}
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
