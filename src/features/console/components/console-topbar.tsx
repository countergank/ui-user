import { Menu, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

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
  /** Desktop sidebar expansion, mirrored into `aria-expanded`. */
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  onOpenDrawer: () => void;
  /** Name of the section the current path belongs to, already translated. */
  sectionLabel: string;
  /** True on the console's landing page, where the breadcrumb would repeat itself. */
  atRoot: boolean;
}

/**
 * The console topbar (COU-278, T5 / S1).
 *
 * Left to right: the navigation controls, the product name, the breadcrumb, and the three
 * global controls — language, theme and the user menu. The theme control stays in the topbar
 * rather than moving into the user menu: it is a frequent action, and COU-270's review
 * already rejected burying it.
 *
 * Two navigation triggers instead of one because the behaviours differ: below `md` the
 * sidebar is a drawer that opens and closes on demand, above it the sidebar is either
 * expanded or not there at all, and that choice is the persisted one (S6). Each is reachable
 * by keyboard and carries its action as its accessible name.
 */
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
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-2 px-4">
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

        <span className="truncate text-sm font-semibold">{tConsole("shell.title")}</span>

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
