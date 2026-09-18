---
priority: P2
category: performance
---

# Use Activity Component for Conditional Rendering

**Do**: Use React 19's `<Activity>` component (or conditional rendering with state preservation) when you need to toggle visibility without unmounting. This avoids re-initialization costs for expensive components.

**Avoid**: Unmounting and remounting complex components on every toggle. Using `display: none` for components that should be hidden from users but remain in the DOM.

**Example**:
```tsx
// Correct: Activity preserves state when hidden
import { Activity } from "react";

function Tabs({ activeTab }: { activeTab: string }) {
  return (
    <>
      <Activity mode={activeTab === "settings" ? "visible" : "hidden"}>
        <SettingsPanel />
      </Activity>
      <Activity mode={activeTab === "profile" ? "visible" : "hidden"}>
        <ProfilePanel />
      </Activity>
    </>
  );
}

// Correct: conditional render when state doesn't need preservation
function Modal({ isOpen }: { isOpen: boolean }) {
  if (!isOpen) return null;
  return <div role="dialog">{/* content */}</div>;
}
```
