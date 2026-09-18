---
priority: P0
category: performance
---

# Avoid Barrel Imports

**Do**: Import directly from the source file path. Barrel files (`index.ts` that re-export everything) force the bundler to parse unused modules and break tree-shaking.

**Avoid**: Creating `index.ts` files that re-export all modules in a directory. Importing from barrels in performance-critical paths.

**Example**:
```ts
// Correct: direct import
import { formatDate } from "@/utils/date/format";
import { validateEmail } from "@/utils/validation/email";

// Wrong: barrel import pulls in entire utils tree
import { formatDate, validateEmail } from "@/utils";
// utils/index.ts re-exports 50+ functions — bundler cannot tree-shake
```
