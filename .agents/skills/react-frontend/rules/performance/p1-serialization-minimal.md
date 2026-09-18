---
priority: P1
category: performance
---

# Minimize Serialized Data to Client Components

**Do**: Pass only the data that client components actually need. Strip unused fields, paginate large collections, and avoid serializing entire database rows to the browser.

**Avoid**: Passing full API responses to client components. Serializing circular references or large binary data.

**Example**:
```tsx
// Correct: only pass what the component needs
<UserCard
  id={user.id}
  name={user.name}
  avatarUrl={user.avatarUrl}
/>

// Wrong: entire user object with sensitive/unused fields
<UserCard user={user} />
// user contains: email, password_hash, created_at, 
//   last_login, preferences, sessions[], ...

// Correct: paginate large lists
<PaginatedList
  items={items.slice(0, 20)}
  total={totalItems}
  page={currentPage}
/>
```
