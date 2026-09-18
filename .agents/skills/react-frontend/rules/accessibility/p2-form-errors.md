---
priority: P2
category: accessibility
---

# Accessible Form Error Messages

**Do**: Link error messages to inputs with `aria-describedby` and set `aria-invalid="true"` when validation fails. Use `role="alert"` on the error container for screen reader announcement.

**Avoid**: Displaying errors visually only without ARIA associations. Using `aria-invalid` without a corresponding error message.

**Example**:
```tsx
// Correct: linked error with aria-describedby
function EmailField({ error }: { error?: string }) {
  const id = "email-input";
  const errorId = "email-error";

  return (
    <div>
      <label htmlFor={id}>Email</label>
      <input
        id={id}
        type="email"
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
      />
      {error && (
        <p id={errorId} role="alert" className="error">
          {error}
        </p>
      )}
    </div>
  );
}

// Wrong: error not associated with input
<input type="email" />
{error && <p className="error">{error}</p>}
```
