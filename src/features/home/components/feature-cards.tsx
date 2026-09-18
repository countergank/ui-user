import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import type { FeatureHighlight } from "../api";

interface FeatureCardsProps {
  features: FeatureHighlight[];
}

/**
 * Presentational feature component rendering a list of highlight cards.
 * Pure rendering only; data arrives via props from the container (ARCH-3).
 */
export function FeatureCards({ features }: FeatureCardsProps) {
  return (
    <ul className="grid gap-4 sm:grid-cols-3" aria-label="Template highlights">
      {features.map((feature) => (
        <li key={feature.id}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>{feature.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>{feature.description}</CardDescription>
            </CardContent>
          </Card>
        </li>
      ))}
    </ul>
  );
}
