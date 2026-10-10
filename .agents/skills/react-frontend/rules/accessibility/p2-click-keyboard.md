---
priority: P2
category: accessibility
---

# Pair onClick with Keyboard Events

**Do**: Always pair `onClick` handlers with `onKeyDown` (Enter and Space) for interactive elements that are not native buttons. Ensure keyboard users can trigger the same action.

**Avoid**: Using `onClick` on `<div>` or `<span>` without keyboard support. Relying on mouse-only interaction patterns.

**Example**:
```tsx
// Correct: click + keyboard on custom interactive element
function CardAction({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      className="card-action"
    >
      {children}
    </div>
  );
}

// Wrong: click only — keyboard users cannot activate
<div onClick={onClick} className="card-action">{children}</div>
```
