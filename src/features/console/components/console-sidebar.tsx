import { useTranslation } from "react-i18next";

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

import { ConsoleNav } from "../console-nav";

interface ConsoleSidebarProps {
  open: boolean;
  drawerOpen: boolean;
  onDrawerOpenChange: (open: boolean) => void;
}

export function ConsoleSidebar({ open, drawerOpen, onDrawerOpenChange }: ConsoleSidebarProps) {
  const { t } = useTranslation("console");

  return (
    <>
      <aside
        id="console-sidebar"
        className={`hidden shrink-0 overflow-hidden border-r bg-background transition-[width] duration-200 ease-out md:block ${
          open ? "w-64" : "invisible w-0 border-r-0"
        }`}
      >
        <div className="sticky top-0 flex h-screen w-64 flex-col overflow-y-auto p-4">
          <ConsoleNav />
        </div>
      </aside>

      <Sheet open={drawerOpen} onOpenChange={onDrawerOpenChange}>
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
