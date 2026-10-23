import { Menu, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { AppLogo } from "@/components/branding/app-logo";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { ThemeSwitcher } from "@/components/theme/theme-switcher";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";

import { UserMenu } from "./user-menu";

interface ConsoleTopbarProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  onOpenDrawer: () => void;
  sectionLabel: string;
  atRoot: boolean;
}

export function ConsoleTopbar({
  sidebarOpen,
  onToggleSidebar,
  onOpenDrawer,
  sectionLabel,
  atRoot,
}: ConsoleTopbarProps) {
  const { t: tConsole } = useTranslation("console");
  const toggleLabel = sidebarOpen
    ? tConsole("shell.collapseSidebar")
    : tConsole("shell.expandSidebar");

  return (
    <header className="sticky top-0 z-40 border-b bg-background">
      <div className="flex h-16 w-full items-center gap-2 px-4 md:px-6">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label={tConsole("shell.openMenu")}
          title={tConsole("shell.openMenu")}
          onClick={onOpenDrawer}
        >
          <Menu aria-hidden="true" className="h-5 w-5" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="hidden md:inline-flex"
          aria-label={toggleLabel}
          title={toggleLabel}
          aria-expanded={sidebarOpen}
          aria-controls="console-sidebar"
          onClick={onToggleSidebar}
        >
          {sidebarOpen ? (
            <PanelLeftClose aria-hidden="true" className="h-5 w-5" />
          ) : (
            <PanelLeftOpen aria-hidden="true" className="h-5 w-5" />
          )}
        </Button>

        <Link
          to="/app"
          className="flex shrink-0 items-center gap-2 rounded-md px-1 py-0.5 transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <AppLogo className="h-6 w-6" />
          <span className="truncate text-sm font-semibold">{tConsole("shell.title")}</span>
        </Link>

        <Breadcrumb className="ml-2 hidden sm:block">
          <BreadcrumbList>
            {atRoot ? (
              <BreadcrumbItem>
                <BreadcrumbPage>{sectionLabel}</BreadcrumbPage>
              </BreadcrumbItem>
            ) : (
              <>
                <BreadcrumbItem>
                  <Link className="transition-colors hover:text-foreground" to="/app">
                    {tConsole("nav.summary")}
                  </Link>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{sectionLabel}</BreadcrumbPage>
                </BreadcrumbItem>
              </>
            )}
          </BreadcrumbList>
        </Breadcrumb>

        <div className="ml-auto flex items-center gap-1">
          <LanguageSwitcher />
          <ThemeSwitcher />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
