---
priority: P0
category: react
---

# Separate Server and Client Component Boundaries

**Do**: Mark components that use browser APIs, state, or effects with `"use client"` at the top. Keep server components free of client-only imports.

**Avoid**: Mixing server and client logic in the same file. Importing client-only libraries (useState, useEffect, window, document) in server components.

**Example**:
```tsx
// app/dashboard/UserProfile.tsx — Server Component (default)
import { db } from "@/lib/db";

export default async function UserProfile({ id }: { id: string }) {
  const user = await db.user.findUnique({ where: { id } });
  return <ProfileCard user={user} />;
}

// app/dashboard/ProfileCard.tsx — Client Component
"use client";

import { useState } from "react";

export function ProfileCard({ user }: { user: User }) {
  const [editing, setEditing] = useState(false);
  return editing ? <EditForm user={user} /> : <DisplayCard user={user} onEdit={() => setEditing(true)} />;
}
```
