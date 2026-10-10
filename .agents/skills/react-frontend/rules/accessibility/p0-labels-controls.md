---
priority: P0
category: accessibility
---

# Associate Labels with Form Controls

**Do**: Use `<label htmlFor="id">` to explicitly associate labels with inputs. Wrap inputs inside labels when possible. Ensure every interactive form control has a visible label.

**Avoid**: Using `placeholder` as the only label. Relying on `aria-label` when a visible label is appropriate.

**Example**:
```tsx
// Correct: explicit htmlFor association
<label htmlFor="email">Email address</label>
<input id="email" type="email" name="email" required />

// Correct: wrapping label
<label>
  Email address
  <input type="email" name="email" required />
</label>

// Wrong: placeholder only (disappears on input)
<input type="email" placeholder="Email address" />
```
