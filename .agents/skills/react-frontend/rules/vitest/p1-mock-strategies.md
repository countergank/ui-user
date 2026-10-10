---
priority: P1
category: vitest
---

# Choose the Right Mock Strategy

**Do**: Place `vi.mock()` calls at the top level of the test file — they are hoisted automatically. Use `vi.clearAllMocks()` in `afterEach` to reset call counts. Use `vi.restoreAllMocks()` to restore original implementations.

**Avoid**: Calling `vi.mock()` inside `it()` or `beforeEach()` (it won't work as expected). Using `vi.resetAllMocks()` when you only need to clear call history.

**Example**:
```ts
// Correct: mock at top level, hoisted automatically
import { fetchData } from "./api";
vi.mock("./api");

afterEach(() => {
  vi.clearAllMocks(); // reset call counts, keep implementations
});

it("calls fetchData once", async () => {
  (fetchData as Mock).mockResolvedValue({ items: [] });
  await renderComponent();
  expect(fetchData).toHaveBeenCalledTimes(1);
});

// Key differences:
// clearAllMocks()  — resets call history (spy/mock)
// resetAllMocks()  — clears + resets to spy
// restoreAllMocks() — restores original implementations
```
