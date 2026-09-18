---
priority: P0
category: react
---

# Use Correct Conditional Rendering Patterns

**Do**: Use `&&` for simple show/hide, ternary for if/else branches, and early returns for complex guard logic. Ensure the left side of `&&` is a boolean, not a truthy value.

**Avoid**: Using `&&` with numbers or arrays that could render `0` or empty brackets. Nesting more than two ternary levels.

**Example**:
```tsx
// Correct: boolean guard with &&
{hasItems && <ItemList items={items} />}

// Correct: ternary for two branches
{isLoading ? <Spinner /> : <Content data={data} />}

// Wrong: number renders as "0"
{items.length && <ItemList items={items} />}

// Fix: convert to boolean
{items.length > 0 && <ItemList items={items} />}
```
