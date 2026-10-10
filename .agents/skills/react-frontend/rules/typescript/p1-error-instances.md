---
priority: P1
category: typescript
---

# Throw Error Instances, Never Strings

**Do**: Always throw `new Error(message)` or a custom class extending `Error`. Error instances capture stack traces, support `instanceof` checks, and work with error boundaries.

**Avoid**: Throwing string literals (`throw "something went wrong"`). Strings lack stack traces and cannot be caught with `instanceof`.

**Example**:
```ts
// Correct: Error instance with stack trace
function parseJSON(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch (cause) {
    throw new Error("Failed to parse JSON", { cause });
  }
}

// Custom error for domain-specific handling
class ValidationError extends Error {
  constructor(public field: string, message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

// Wrong: string throw — no stack, no instanceof
throw "parse failed";
```
