---
priority: P0
category: react
---

# Use Stable Key Props in Lists

**Do**: Use stable, unique identifiers from data as `key` props. Keys must be unique among siblings and consistent across renders.

**Avoid**: Using array indices as keys when the list can reorder, filter, or insert items. Generating random keys on each render.

**Example**:
```tsx
// Correct: stable unique ID
{users.map((user) => (
  <UserCard key={user.id} user={user} />
))}

// Wrong: index key breaks on reorder
{users.map((user, index) => (
  <UserCard key={index} user={user} />
))}

// Wrong: random key remounts every render
{users.map((user) => (
  <UserCard key={crypto.randomUUID()} user={user} />
))}
```
