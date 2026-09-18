interface AppEnvBadgeProps {
  mode: "development" | "staging" | "production";
  apiBaseUrl: string;
}

/**
 * Presentational badge showing the resolved runtime environment (COU-125, ADR-11).
 *
 * Receives values as props (ARCH-2) so it stays pure; the container imports
 * `env`/`envMode` from `@/lib/env` and passes them down. Rendered as a plain
 * list item labelled "Environment" so it is announced to assistive tech.
 */
export function AppEnvBadge({ mode, apiBaseUrl }: AppEnvBadgeProps) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-md border bg-muted px-3 py-2 text-xs text-foreground">
      <span>
        <span className="font-semibold">Environment:</span> {mode}
      </span>
      <span aria-hidden="true">·</span>
      <span>
        <span className="font-semibold">API base:</span> {apiBaseUrl}
      </span>
    </div>
  );
}
