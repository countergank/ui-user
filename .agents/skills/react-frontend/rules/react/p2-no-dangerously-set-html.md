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

// Correct: sanitize when HTML is required
import DOMPurify from "dompurify";
function RichContent({ html }: { html: string }) {
  return <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(html) }} />;
}

// Wrong: XSS vulnerability
function UserBio({ bio }: { bio: string }) {
  return <div dangerouslySetInnerHTML={{ __html: bio }} />;
}
```

**Reference**: https://react.dev/reference/react-dom/components/common#dangerously-setting-the-inner-html
