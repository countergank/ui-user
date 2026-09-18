---
priority: P1
category: vitest
---

# Prefer user-event Over fireEvent

**Do**: Use `@testing-library/user-event` to simulate realistic user interactions. It fires the full sequence of events a real user would trigger (focus, keydown, keypress, keyup, input, change, blur).

**Avoid**: Using `fireEvent` for user interactions (fires single events in isolation). Using `fireEvent.change` on inputs when `user.type()` better simulates real typing.

**Example**:
```tsx
import userEvent from "@testing-library/user-event";

it("submits form on enter", async () => {
  const user = userEvent.setup();
  render(<SearchForm />);

  const input = screen.getByRole("searchbox");
  await user.type(input, "react testing{enter}");

  expect(screen.getByText(/results for "react testing"/i)).toBeInTheDocument();
});

// Wrong: fireEvent skips intermediate events
fireEvent.change(input, { target: { value: "react testing" } });
fireEvent.keyDown(input, { key: "Enter" });
```
