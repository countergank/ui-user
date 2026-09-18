---
priority: P2
category: composition
---

# Extract Reusable Components Early

**Do**: Extract a component when the same UI pattern appears in 2+ places, or when a single component exceeds ~150 lines of JSX. Name extracted components for their responsibility, not their location.

**Avoid**: Copy-pasting JSX blocks across files. Components that handle rendering, data fetching, and state management simultaneously.

**Example**:
```tsx
// Correct: extracted reusable component
// components/UserAvatar.tsx
export function UserAvatar({ user, size = "md" }: UserAvatarProps) {
  const sizes = { sm: 32, md: 48, lg: 64 };
  return (
    <img
      src={user.avatarUrl}
      alt={`${user.name}'s avatar`}
      width={sizes[size]}
      height={sizes[size]}
      className={`avatar avatar-${size}`}
    />
  );
}

// Used in multiple places
import { UserAvatar } from "@/components/UserAvatar";
<UserAvatar user={author} size="sm" />
<UserAvatar user={currentUser} />

// Wrong: duplicated avatar markup in 3 different files
<img src={user.avatarUrl} alt="" width="32" height="32" />
```
