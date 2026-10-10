---
priority: P3
category: typescript
---

# Understand Declaration Merging

**Do**: Use declaration merging sparingly to extend third-party types or add properties to global interfaces like `Window` or `HTMLElementTagNameMap`. Keep merged declarations in dedicated `.d.ts` files.

**Avoid**: Relying on declaration merging for application logic. Merging interfaces across multiple files without clear ownership.

**Example**:
```ts
// Correct: extend global types in a dedicated .d.ts file
// types/global.d.ts
interface Window {
  analytics?: { track: (event: string, data: unknown) => void };
}

// Correct: extend DOM element map for custom elements
interface HTMLElementTagNameMap {
  "custom-tooltip": CustomTooltipElement;
}

// Wrong: scattering merges across feature files
// components/Button.tsx
interface ButtonProps { variant: "primary" | "secondary" }
// components/Card.tsx
interface ButtonProps { size: "sm" | "md" | "lg" }
// These merge unexpectedly — hard to trace
```
