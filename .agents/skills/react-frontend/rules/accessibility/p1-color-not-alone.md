---
priority: P1
category: accessibility
---

# Never Use Color Alone to Convey Information

**Do**: Provide additional visual cues alongside color: icons, text labels, patterns, or underlines. Color should enhance, not be the sole carrier of meaning.

**Avoid**: Using only red/green to indicate error/success. Relying on color changes to show active states or required fields.

**Example**:
```tsx
// Correct: color + icon + text
<input className={hasError ? "error" : ""} />
{hasError && (
  <span className="error-message">
    <AlertIcon /> Please enter a valid email
  </span>
)}

// Correct: required field with visual indicator
<label>
  Email <span aria-hidden="true">*</span>
  <span className="sr-only">(required)</span>
</label>

// Wrong: color alone indicates error
<input style={{ borderColor: hasError ? "red" : "gray" }} />
```
