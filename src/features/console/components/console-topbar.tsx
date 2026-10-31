import { Bell, Menu, PanelLeftClose, PanelLeftOpen, Search } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";

import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { ThemeSwitcher } from "@/components/theme/theme-switcher";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";

import { UserMenu } from "./user-menu";

interface ConsoleTopbarProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  onOpenDrawer: () => void;
  sectionLabel: string;
  atRoot: boolean;
  pageTrail?: { label: string; to?: string }[];
}

export function ConsoleTopbar({
  sidebarOpen,
  onToggleSidebar,
  onOpenDrawer,
  sectionLabel,
  atRoot,
  pageTrail = [],
}: ConsoleTopbarProps) {
  const { t: tConsole } = useTranslation("console");
  const navigate = useNavigate();
  const [term, setTerm] = useState("");
  const trimmed = term.trim();
  const searchTarget =
    trimmed === "" ? "/app/users" : `/app/users?search=${encodeURIComponent(trimmed)}`;

  const toggleLabel = sidebarOpen
    ? tConsole("shell.collapseSidebar")
    : tConsole("shell.expandSidebar");

  return (
    <header className="sticky top-0 z-40 border-b bg-background">
      <div className="flex h-16 w-full items-center gap-3 px-4 md:px-6">
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

        <Breadcrumb className="ml-2 hidden sm:block">
          <BreadcrumbList>
            {atRoot && pageTrail.length === 0 ? (
              <BreadcrumbItem>
                <BreadcrumbPage>{sectionLabel}</BreadcrumbPage>
              </BreadcrumbItem>
            ) : (
              <>
                <BreadcrumbItem>
                  <Link className="transition-colors hover:text-foreground" to="/app">
                    {tConsole("nav.home")}
                  </Link>
                </BreadcrumbItem>
                {pageTrail.length === 0 ? (
                  <BreadcrumbItem>
                    <BreadcrumbPage>{sectionLabel}</BreadcrumbPage>
                  </BreadcrumbItem>
                ) : (
                  <>
                    <BreadcrumbItem>
                      <Link className="transition-colors hover:text-foreground" to="/app/users">
                        {sectionLabel}
                      </Link>
                    </BreadcrumbItem>
                    {pageTrail.map((crumb) => (
                      <BreadcrumbItem key={crumb.label}>
                        <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                      </BreadcrumbItem>
                    ))}
                  </>
                )}
              </>
            )}
          </BreadcrumbList>
        </Breadcrumb>

        <div className="ml-auto flex items-center gap-2.5">
          <search className="hidden min-w-0 w-80 items-center lg:flex">
            <form
              onSubmit={(event) => {
                event.preventDefault();
                void navigate(searchTarget);
              }}
              className="w-full"
            >
              <label className="relative w-full">
                <span className="sr-only">{tConsole("shell.searchLabel")}</span>
                <Search
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                />
                <input
                  type="search"
                  aria-label={tConsole("shell.searchLabel")}
                  value={term}
                  onChange={(event) => {
                    setTerm(event.target.value);
                  }}
                  placeholder={tConsole("shell.searchPlaceholder")}
                  className="h-9 w-full rounded-md border border-input bg-muted pl-9 pr-3 text-sm placeholder:text-muted-foreground"
                />
              </label>
            </form>
          </search>

          <ThemeSwitcher variant="segmented" />
          <LanguageSwitcher variant="code" />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-md border border-input bg-muted text-muted-foreground"
            aria-label={tConsole("shell.notifications")}
            title={`${tConsole("shell.notifications")} · ${tConsole("nav.pending")}`}
            disabled
          >
            <Bell aria-hidden="true" />
          </Button>
          <UserMenu ariaLabel={tConsole("shell.profile")} />
        </div>
      </div>
    </header>
  );
}
