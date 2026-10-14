import { QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";

import "@/lib/i18n";
import { queryClient } from "@/lib/query-client";
import { startThemeSync } from "@/lib/theme/theme-sync";
import { router } from "@/routes";

import "./styles/index.css";

// One-time composition-root setup: hydrate the stored theme preference and apply
// it to <html> before React renders (index.html has a pre-paint script for the
// gap before this module loads).
startThemeSync();

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
