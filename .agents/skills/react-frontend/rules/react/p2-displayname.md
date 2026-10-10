---
priority: P2
category: react
---

# Use displayName for Debugging

**Do**: Set `displayName` on components, HOCs, and custom hooks for readable React DevTools output. React infers it from the function name, but explicit `displayName` survives minification.

**Avoid**: Relying solely on function names in production builds. Anonymous arrow functions assigned to variables without `displayName`.

**Example**:
```tsx
// Correct: explicit displayName survives minification
const withAuth = <P extends object>(Wrapped: React.ComponentType<P>) => {
  const WithAuth = (props: P) => {
    // auth logic
    return <Wrapped {...props} />;
  };
  WithAuth.displayName = `withAuth(${Wrapped.displayName || Wrapped.name})`;
  return WithAuth;
};

// Correct: hooks with displayName
function useDebounce<T>(value: T, delay: number) {
  // ...
}
useDebounce.displayName = "useDebounce";

// Wrong: anonymous function — DevTools shows "Unknown"
export default () => <div>Hello</div>;
```
