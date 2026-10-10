---
priority: P2
category: vitest
---

# Write Integration Tests for Component Flows

**Do**: Test complete user flows that span multiple components — form submission, navigation, data fetching. Use `render` from Testing Library with real providers (Router, QueryClient, Theme).

**Avoid**: Mocking every child component in integration tests. Testing implementation details instead of user-visible behavior.

**Example**:
```tsx
// Correct: integration test with real providers
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { SignupFlow } from "./SignupFlow";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

it("completes signup flow", async () => {
  const user = userEvent.setup();
  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <SignupFlow />
      </MemoryRouter>
    </QueryClientProvider>
  );

  await user.type(screen.getByLabel("Email"), "test@example.com");
  await user.type(screen.getByLabel("Password"), "secure123");
  await user.click(screen.getByRole("button", { name: /sign up/i }));

  expect(await screen.findByText(/welcome/i)).toBeInTheDocument();
});
```
