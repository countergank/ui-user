import type { ReactNode } from "react";

import { CardContent, CardHeader } from "@/components/ui/card";

interface SectionCardProps {
  title: string;
  meta?: ReactNode;
  children: ReactNode;
}

export function SectionCard({ title, meta, children }: SectionCardProps) {
  return (
    <div className="rounded-xl border border-panel-border bg-panel text-panel-foreground shadow">
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <h2 className="text-sm font-medium text-panel-foreground">{title}</h2>
        {meta ? <div className="text-xs text-panel-subtle">{meta}</div> : null}
      </CardHeader>
      <CardContent className="flex flex-col gap-4">{children}</CardContent>
    </div>
  );
}

interface FieldRowProps {
  term: string;
  mono?: boolean;
  children: ReactNode;
}

export function FieldRow({ term, mono = false, children }: FieldRowProps) {
  return (
    <div className="flex flex-col gap-1 border-b border-panel-border py-3 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
      <dt className="text-xs text-panel-subtle">{term}</dt>
      <dd
        className={
          mono
            ? "text-xs font-medium font-mono text-panel-foreground"
            : "text-sm font-medium text-panel-foreground"
        }
      >
        {children}
      </dd>
    </div>
  );
}
