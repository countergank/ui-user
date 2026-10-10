import type { ReactNode } from "react";

interface HeroProps {
  title: string;
  subtitle: string;
  children?: ReactNode;
}

/**
 * Presentational feature component: receives props, holds no data-fetching
 * or routing concerns (ARCH-2 / ARCH-3).
 */
export function Hero({ title, subtitle, children }: HeroProps) {
  return (
    <section className="flex flex-col items-start gap-6 rounded-xl border bg-card p-8 text-card-foreground shadow-sm">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
        <p className="max-w-prose text-muted-foreground">{subtitle}</p>
      </div>
      {children}
    </section>
  );
}
