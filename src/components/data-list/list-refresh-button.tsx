import { RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";

export interface ListRefreshButtonProps {
  label: string;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

/**
 * @param label - accessible name and tooltip; the icon alone does not say what it refreshes.
 * @param isRefreshing - disables the control and spins the icon while the request is in flight.
 */
export function ListRefreshButton({
  label,
  onRefresh,
  isRefreshing = false,
}: ListRefreshButtonProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label={label}
      title={label}
      onClick={onRefresh}
      disabled={isRefreshing}
    >
      <RefreshCw aria-hidden="true" className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
    </Button>
  );
}
