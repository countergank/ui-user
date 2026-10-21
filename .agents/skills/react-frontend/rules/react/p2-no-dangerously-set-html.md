---
priority: P2
category: react
---

# Never Use dangerouslySetInnerHTML

**Do**: Use semantic elements and text content for rendering user or external data. If HTML rendering is unavoidable, sanitize input with DOMPurify or a trusted library before passing to `dangerouslySetInnerHTML`.

**Avoid**: Passing unsanitized user input to `dangerouslySetInnerHTML`. Using it when a safe React rendering alternative exists.

**Example**:
```tsx
// Correct: render text content safely
function Comment({ text }: { text: string }) {
  return <p>{text}</p>;
}

// Correct: the single audited escape hatch for genuinely unavoidable raw
// HTML. Keep it in one module; it sanitizes with DOMPurify, and only the
// sanitized return value may ever reach React's raw-HTML prop
// (dangerouslySetInnerHTML) inside that helper.
import DOMPurify from "dompurify";

export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, { USE_PROFILES: { html: true } });
}

// Usage: pass only sanitizeHtml(output) to the raw-HTML escape hatch —
// never raw user or model output.

// Wrong: building HTML strings from user input and rendering them without
// sanitization (XSS). Any path where an unsanitized string reaches the
// raw-HTML prop is a vulnerability.
function UserBio({ bio }: { bio: string }) {
  const markup = `<p>${bio}</p>`; // unsanitized interpolation
  return renderRawHtml(markup); // XSS sink
}
```

**Reference**: https://react.dev/reference/react-dom/components/common#dangerously-setting-the-inner-html
