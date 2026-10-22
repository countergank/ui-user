import { useTranslation } from "react-i18next";

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

import { ConsoleNav } from "../console-nav";

interface ConsoleSidebarProps {
  /** Desktop expansion. Persisted: it is the user's standing preference (S6). */
  open: boolean;
  /** Mobile drawer. Deliberately not persisted: a drawer is a moment, not a preference. */
  drawerOpen: boolean;
  onDrawerOpenChange: (open: boolean) => void;
}

/**
 * The console's sidebar (COU-278, T3, T4 / S1, S6, S9): one navigation, two presentations —
 * a static column on desktop, a Radix `Sheet` drawer below `md`. Collapsed means **not
 * rendered**, not styled away: a hidden-but-focusable navigation is the classic keyboard trap.
 */
export function ConsoleSidebar({ open, drawerOpen, onDrawerOpenChange }: ConsoleSidebarProps) {
  const { t } = useTranslation("console");

  return (
    <>
      {open ? (
        <aside className="hidden w-64 shrink-0 border-r bg-background md:block">
          <div className="sticky top-0 flex max-h-screen flex-col overflow-y-auto p-4">
            <ConsoleNav />
          </div>
        </aside>
      ) : null}

      <Sheet open={drawerOpen} onOpenChange={onDrawerOpenChange}>
        {/* `aria-describedby={undefined}`: the drawer is a navigation menu, and Radix's
            missing-description warning is a false positive once the title is set. */}
        <SheetContent side="left" className="w-72 bg-background" aria-describedby={undefined}>
          <SheetHeader>
            <SheetTitle>{t("nav.label")}</SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            <ConsoleNav
              onNavigate={() => {
                onDrawerOpenChange(false);
              }}
            />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
