import { Search } from "lucide-react";
import { useTranslation } from "react-i18next";

type MockUserNameKey = "ana" | "marta" | "julian" | "diego";
type MockUserRoleKey = Exclude<MockUserNameKey, "diego">;

interface MockUser {
  key: MockUserNameKey;
  roleKey?: MockUserRoleKey;
  avatar: string;
  status: "active" | "blocked";
}

const initials = (name: string) =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

const MOCK_USERS: MockUser[] = [
  {
    key: "ana",
    roleKey: "ana",
    avatar: "bg-[hsl(var(--avatar-2-bg))] text-[hsl(var(--avatar-2-fg))]",
    status: "active",
  },
  {
    key: "marta",
    roleKey: "marta",
    avatar: "bg-[hsl(var(--avatar-3-bg))] text-[hsl(var(--avatar-3-fg))]",
    status: "active",
  },
  {
    key: "julian",
    roleKey: "julian",
    avatar: "bg-[hsl(var(--avatar-4-bg))] text-[hsl(var(--avatar-4-fg))]",
    status: "active",
  },
  { key: "diego", avatar: "bg-danger-soft text-destructive", status: "blocked" },
];

/**
 * Decorative product mock used as visual proof on the public landing hero.
 *
 * Renders a static miniature of the administration console with real text but
 * `aria-hidden` on the outer element, so screen readers skip it entirely. It
 * holds no state, fetches nothing and contains no links.
 *
 * @returns The product preview markup.
 */
export function ProductPreview() {
  const { t } = useTranslation("landing");

  return (
    <div
      aria-hidden="true"
      data-testid="product-preview"
      className="overflow-hidden rounded-2xl border bg-card font-sans shadow-lg"
    >
      <div className="flex items-center gap-1.5 border-b border-border bg-[hsl(var(--surface-raised))] px-3.5 py-2.5">
        <span className="size-2 rounded-full bg-border" />
        <span className="size-2 rounded-full bg-border" />
        <span className="size-2 rounded-full bg-border" />
      </div>
      <div className="flex">
        <div className="flex w-28 shrink-0 flex-col gap-1.5 bg-sidebar p-3 sm:w-32">
          <p className="font-mono text-[0.5rem] uppercase tracking-[0.2em] text-sidebar-faint">
            {t("mock.sidebar.label")}
          </p>
          <span className="rounded-md bg-sidebar-accent px-2 py-1.5 text-[0.6rem] leading-tight text-sidebar-foreground">
            {t("mock.sidebar.users")}
          </span>
          {(["roles", "audit", "settings"] as const).map((item) => (
            <span key={item} className="px-2 py-1.5 text-[0.6rem] leading-tight text-sidebar-faint">
              {t(`mock.sidebar.${item}`)}
            </span>
          ))}
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-center gap-2.5 border-b border-border px-3.5 py-3">
            <span className="flex min-w-0 flex-1 items-center gap-1.5 rounded-md bg-muted px-2 py-1.5">
              <Search className="size-2.5 shrink-0 text-muted-foreground" />
              <span className="truncate text-[0.6rem] text-muted-foreground">
                {t("mock.search.placeholder")}
              </span>
            </span>
            <span className="shrink-0 rounded-md bg-primary px-2.5 py-1.5 text-[0.6rem] font-medium text-primary-foreground">
              {t("mock.actions.newUser")}
            </span>
          </div>
          <div className="flex items-center gap-2 px-3.5 py-3">
            {(["total", "active", "blocked"] as const).map((kpi) => (
              <div
                key={kpi}
                className="flex min-w-0 flex-1 flex-col gap-0.5 rounded-lg border border-[hsl(var(--border-subtle))] bg-[hsl(var(--surface-raised))] px-2.5 py-2"
              >
                <span className="font-mono text-[0.5rem] uppercase tracking-wide text-muted-foreground">
                  {t(`mock.kpi.${kpi}`)}
                </span>
                <span
                  className={`font-display text-sm font-bold leading-none ${
                    kpi === "active"
                      ? "text-success"
                      : kpi === "blocked"
                        ? "text-destructive"
                        : "text-foreground"
                  }`}
                >
                  {t(`mock.kpi.${kpi}Value`)}
                </span>
              </div>
            ))}
          </div>
          <div className="flex flex-col">
            {MOCK_USERS.map((user) => (
              <div
                key={user.key}
                className="flex items-center gap-2.5 border-t border-[hsl(var(--border-subtle))] px-3.5 py-2.5 first:border-t-0"
              >
                <span
                  className={`flex size-6 shrink-0 items-center justify-center rounded-full font-mono text-[0.5rem] font-semibold ${user.avatar}`}
                >
                  {initials(t(`mock.users.${user.key}.name`))}
                </span>
                <span className="flex min-w-0 flex-col gap-0.5">
                  <span className="truncate text-[0.7rem] font-medium leading-tight text-foreground">
                    {t(`mock.users.${user.key}.name`)}
                  </span>
                  {user.roleKey ? (
                    <span className="font-mono text-[0.55rem] leading-tight text-muted-foreground">
                      {t(`mock.users.${user.roleKey}.role`)}
                    </span>
                  ) : null}
                </span>
                <span
                  className={`ml-auto shrink-0 rounded-full px-2 py-1 font-mono text-[0.6rem] leading-none ${
                    user.status === "active"
                      ? "bg-success/15 text-success-foreground"
                      : "bg-danger/15 text-danger-foreground"
                  }`}
                >
                  <span>{t(`mock.status.${user.status}`)}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
