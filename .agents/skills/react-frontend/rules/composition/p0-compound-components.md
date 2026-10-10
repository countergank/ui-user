---
priority: P0
category: composition
---

# Use Compound Components for Related UI

**Do**: Group related sub-components under a parent namespace using dot notation or context-based composition. Let consumers compose the pieces they need without passing exhaustive prop objects.

**Avoid**: Single components with 15+ props controlling every sub-element. Prop drilling configuration through deeply nested children.

**Example**:
```tsx
// Correct: compound components
function Select({ children }: { children: React.ReactNode }) {
  return <div className="select">{children}</div>;
}
Select.Trigger = Trigger;
Select.List = List;
Select.Option = Option;

// Usage
<Select>
  <Select.Trigger placeholder="Choose..." />
  <Select.List>
    <Select.Option value="a">A</Select.Option>
  </Select.List>
</Select>
```
