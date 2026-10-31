import { useTranslation } from "react-i18next";
import { NavLink } from "react-router-dom";

import { usePermissions } from "@/features/authorization/hooks/use-permissions";

import { CONSOLE_NAV, type ConsoleNavGroup, visibleNavItems } from "./navigation";

const GROUPS: readonly ConsoleNavGroup[] = ["management", "system"];

function navLinkClass({ isActive }: { isActive: boolean }): string {
  return `relative flex items-center rounded-[10px] px-3.5 py-2 text-[13.5px] font-medium leading-4 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-highlight focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar ${
    isActive
      ? "bg-sidebar-accent text-sidebar-foreground"
      : "text-sidebar-subtle hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
  }`;
}

function groupLabelKey(group: ConsoleNavGroup): "nav.group.management" | "nav.group.system" {
  return group === "management" ? "nav.group.management" : "nav.group.system";
}

interface ConsoleNavProps {
  onNavigate?: () => void;
}

export function ConsoleNav({ onNavigate }: ConsoleNavProps = {}) {
  const { t } = useTranslation("console");
  const { permissions } = usePermissions();
  const items = visibleNavItems(CONSOLE_NAV, permissions);

  return (
    <nav aria-label={t("nav.label")} className="flex flex-col gap-6">
      {GROUPS.map((group) => {
        const groupItems = items.filter((item) => item.group === group);

        if (groupItems.length === 0) {
          return null;
        }

        return (
          <div key={group}>
            <p className="mb-2 px-3 font-mono text-[0.65rem] uppercase tracking-[0.18em] text-sidebar-faint">
              {t(groupLabelKey(group))}
            </p>
            <ul className="flex flex-col gap-1">
              {groupItems.map((item) => (
                <li key={item.to}>
                  {item.implemented === false ? (
                    <span
                      aria-disabled="true"
                      className="flex cursor-not-allowed items-center rounded-[10px] px-3.5 py-2 text-[13.5px] font-medium leading-4 text-sidebar-faint"
                    >
                      {t(item.labelKey)}
                      <span className="sr-only"> — {t("nav.pending")}</span>
                    </span>
                  ) : (
                    <NavLink
                      to={item.to}
                      end={item.to === "/app"}
                      className={navLinkClass}
                      onClick={onNavigate}
                    >
                      {({ isActive }) => (
                        <>
                          {isActive ? (
                            <span
                              aria-hidden="true"
                              className="absolute left-2 top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-[2px] bg-sidebar-highlight"
                            />
                          ) : null}
                          {t(item.labelKey)}
                        </>
                      )}
                    </NavLink>
                  )}
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </nav>
  );
}
