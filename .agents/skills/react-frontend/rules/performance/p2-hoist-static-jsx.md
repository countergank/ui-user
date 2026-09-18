---
priority: P2
category: performance
---

# Hoist Static JSX Elements

**Do**: Extract static JSX elements (those that don't depend on props or state) outside the component function. This prevents React from recreating them on every render.

**Avoid**: Defining static elements inside the component body. Creating new object/array literals in JSX that could be hoisted.

**Example**:
```tsx
// Correct: static element hoisted outside component
const EMPTY_STATE = (
  <div className="empty">
    <p>No items yet</p>
    <button>Add your first item</button>
  </div>
);

function ItemList({ items }: { items: string[] }) {
  if (items.length === 0) return EMPTY_STATE;
  return <ul>{items.map(i => <li key={i}>{i}</li>)}</ul>;
}

// Wrong: recreated on every render
function ItemList({ items }: { items: string[] }) {
  const emptyState = (
    <div className="empty">
      <p>No items yet</p>
    </div>
  );
  if (items.length === 0) return emptyState;
  return <ul>{items.map(i => <li key={i}>{i}</li>)}</ul>;
}
```
