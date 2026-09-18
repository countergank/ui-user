---
priority: P2
category: typescript
---

# Avoid Non-Null Assertions

**Do**: Use optional chaining, type guards, or explicit null checks instead of `!`. Narrow types with `if (value)` or `typeof` checks before accessing properties.

**Avoid**: The `!` non-null assertion operator. It tells TypeScript to trust you — but if the value is actually null at runtime, you get an error with no compile-time warning.

**Example**:
```ts
interface User { profile?: { name: string } }

// Correct: type guard narrows the type
function greet(user: User) {
  if (user.profile) {
    console.log(`Hello, ${user.profile.name}`);
  }
}

// Correct: optional chaining with fallback
function getDisplayName(user: User) {
  return user.profile?.name ?? "Guest";
}

// Wrong: non-null assertion — runtime crash if profile is undefined
function greetUnsafe(user: User) {
  console.log(`Hello, ${user.profile!.name}`);
}
```
