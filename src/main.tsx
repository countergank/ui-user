import { QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";

import "@/lib/i18n";
import { queryClient } from "@/lib/query-client";
import { sessionManager, startProactiveRefresh } from "@/lib/session/session";
import { startThemeSync } from "@/lib/theme/theme-sync";
import { hydrateSidebarState } from "@/lib/ui/sidebar-sync";
import { router } from "@/routes";

import "./styles/index.css";

startThemeSync();

hydrateSidebarState();

startProactiveRefresh(sessionManager);

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error('Root element with id "root" not found in index.html');
}

createRoot(rootElement).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
);
