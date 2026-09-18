---
priority: P0
category: vitest
---

# Use Testing Library Queries by Role

**Do**: Query elements by their accessible role using `getByRole`, `findByRole`, or `queryByRole`. This ensures tests verify what users actually perceive.

**Avoid**: Using `getByTestId` as the primary query method. Querying by class names or DOM structure that changes with styling.

**Example**:
```tsx
import { render, screen } from "@testing-library/react";
import { UserProfile } from "./UserProfile";

it("displays the user name", async () => {
  render(<UserProfile user={{ name: "Ana", role: "admin" }} />);
  expect(await screen.findByRole("heading", { name: /ana/i })).toBeInTheDocument();
});

it("shows edit button for owners", () => {
  render(<UserProfile user={{ name: "Ana" }} isOwner />);
  expect(screen.getByRole("button", { name: /edit/i })).toBeInTheDocument();
});

// Wrong: testId bypasses accessibility semantics
screen.getByTestId("user-name");
```
