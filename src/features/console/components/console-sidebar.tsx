import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { AppLogo } from "@/components/branding/app-logo";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

import { ConsoleNav } from "../console-nav";
import { UserMenu } from "./user-menu";

interface ConsoleSidebarProps {
  open: boolean;
  drawerOpen: boolean;
  onDrawerOpenChange: (open: boolean) => void;
}

function SidebarBrand() {
  const { t } = useTranslation("console");

  return (
    <Link
      to="/app"
      aria-label={t("shell.title")}
      className="mb-6 flex shrink-0 items-center gap-2.5 rounded-md px-2 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-highlight"
    >
      <AppLogo className="h-8 w-8" />
      <span className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-sidebar-foreground">
        Countergank
      </span>
    </Link>
  );
}

export function ConsoleSidebar({ open, drawerOpen, onDrawerOpenChange }: ConsoleSidebarProps) {
  const { t } = useTranslation("console");

  return (
    <>
      <aside
        id="console-sidebar"
        className={`hidden shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width] duration-200 ease-out md:flex ${
          open ? "w-64" : "invisible w-0 border-r-0"
        }`}
      >
        <div className="flex min-h-0 w-full flex-1 flex-col overflow-y-auto overflow-x-hidden p-4">
          <SidebarBrand />
          <ConsoleNav />
          <div className="mt-auto pt-6">
            <UserMenu variant="full" />
          </div>
        </div>
      </aside>

      <Sheet open={drawerOpen} onOpenChange={onDrawerOpenChange}>
        <SheetContent
          side="left"
          className="flex w-72 max-w-[85vw] flex-col overflow-hidden border-sidebar-border bg-sidebar text-sidebar-foreground"
          aria-describedby={undefined}
        >
          <SheetHeader>
            <SheetTitle>{t("nav.label")}</SheetTitle>
          </SheetHeader>
          <div className="mt-6 flex min-h-0 flex-1 flex-col overflow-y-auto">
            <ConsoleNav
              onNavigate={() => {
                onDrawerOpenChange(false);
              }}
            />
            <div className="mt-auto pt-6">
              <UserMenu variant="full" />
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
