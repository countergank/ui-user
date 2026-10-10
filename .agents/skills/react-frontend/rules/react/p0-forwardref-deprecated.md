---
priority: P0
category: react
---

# Avoid Deprecated forwardRef Pattern

**Do**: Use the React 19 ref prop directly — refs are now passed as a regular prop to function components. Type refs with `Ref<T>` from React.

**Avoid**: Wrapping components with `forwardRef()`. Using the legacy two-argument component signature `(props, ref) =>`.

**Example**:
```tsx
// React 19 — ref as a regular prop
import type { Ref } from "react";

interface InputProps {
  label: string;
  ref?: Ref<HTMLInputElement>;
}

export function Input({ label, ref }: InputProps) {
  return (
    <label>
      {label}
      <input ref={ref} type="text" />
    </label>
  );
}

// Legacy (avoid in React 19+)
const LegacyInput = forwardRef<HTMLInputElement, { label: string }>(
  ({ label }, ref) => { ... }
);
```
