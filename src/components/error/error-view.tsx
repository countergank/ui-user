import { Button } from "@/components/ui/button";

interface ErrorViewProps {
  title: string;
  message: string;
  onRetry?: () => void;
}

/**
 * Accessible, reusable error presentation (ARCH-4, a11y).
 * Announced to screen readers via `role="alert"`, keeps focus/announcement
 * semantics, and exposes an optional retry action.
 */
export function ErrorView({ title, message, onRetry }: ErrorViewProps) {
  return (
    <section
      role="alert"
      aria-live="assertive"
      className="flex flex-col items-start gap-4 rounded-xl border border-destructive/40 bg-destructive/5 p-6"
    >
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-semibold text-destructive">{title}</h2>
        <p className="max-w-prose text-foreground">{message}</p>
      </div>
      {onRetry ? (
        <Button type="button" variant="outline" onClick={onRetry}>
          Try again
        </Button>
      ) : null}
    </section>
  );
}
