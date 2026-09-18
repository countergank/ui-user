---
priority: P1
category: typescript
---

# Mark Immutable Props as Readonly

**Do**: Use `readonly` modifier on component props that should not be mutated. This communicates intent and lets TypeScript catch accidental mutations at compile time.

**Avoid**: Mutating props directly. Omitting `readonly` on props that are passed through multiple levels and should remain immutable.

**Example**:
```tsx
// Correct: readonly props prevent mutation
interface CardProps {
  readonly title: string;
  readonly tags: readonly string[];
  readonly onClick: () => void;
}

function Card({ title, tags, onClick }: CardProps) {
  return (
    <div onClick={onClick}>
      <h2>{title}</h2>
      {tags.map(tag => <span key={tag}>{tag}</span>)}
    </div>
  );
}

// Wrong: mutable props invite accidental changes
interface BadProps {
  title: string;
  tags: string[]; // caller might mutate this array
}
```
