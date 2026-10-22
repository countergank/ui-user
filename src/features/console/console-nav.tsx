import { useTranslation } from "react-i18next";
import { NavLink } from "react-router-dom";

import { usePermissions } from "@/features/authorization/hooks/use-permissions";

import { CONSOLE_NAV, visibleNavItems } from "./navigation";

/**
 * The console's section navigation (COU-275, T4 / S3, S4). Reads the session's permissions
 * and hands the filtered manifest to the links; nothing here decides layout. `NavLink` is
 * the single source of the active link's visual state and its `aria-current="page"`.
 */
function navLinkClass({ isActive }: { isActive: boolean }): string {
  return `flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
    isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground"
  }`;
}

interface ConsoleNavProps {
  /** Fired after a section link is activated; the mobile drawer closes on it. */
  onNavigate?: () => void;
}

export function ConsoleNav({ onNavigate }: ConsoleNavProps = {}) {
  const { t } = useTranslation("console");
  const { permissions } = usePermissions();
  const items = visibleNavItems(CONSOLE_NAV, permissions);

  return (
    <nav aria-label={t("nav.label")}>
      <ul className="flex flex-col gap-1">
        {items.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              end={item.to === "/app"}
              className={navLinkClass}
              onClick={onNavigate}
            >
              {t(item.labelKey)}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
