import { QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";

import "@/lib/i18n";
import { queryClient } from "@/lib/query-client";
import { sessionManager, startProactiveRefresh } from "@/lib/session/session";
import { startThemeSync } from "@/lib/theme/theme-sync";
import { router } from "@/routes";

import "./styles/index.css";

// One-time composition-root setup: hydrate the stored theme preference and apply
// it to <html> before React renders (index.html has a pre-paint script for the
// gap before this module loads).
startThemeSync();

// The proactive access-token refresh only exists as a subscription: nothing else
// knows when the store gained or rotated a token (COU-281, T2).
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
