import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Lazy-loaded route module for "/about" (bundle-001).
 * Deliberately simple to demonstrate the lazy route + Suspense boundary path.
 */
export function Component() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-semibold tracking-tight">About</h1>
      <Card>
        <CardHeader>
          <CardTitle>Standard Frontend Template</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="max-w-prose text-muted-foreground">
            A feature-based (screaming) React 19 architecture with an accessible shell, typed error
            handling, TanStack Query for server state, and lazy React Router routes.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
