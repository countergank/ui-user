---
priority: P0
category: typescript
---

# Use ESM Import Syntax Exclusively

**Do**: Use `import`/`export` for all module boundaries. Set `"module": "ESNext"` and `"moduleResolution": "bundler"` in tsconfig. Use `.js` extensions in relative imports when required by the bundler.

**Avoid**: CommonJS `require()` and `module.exports`. Mixing ESM and CJS in the same dependency graph.

**Example**:
```ts
// Correct: ESM imports
import { useState } from "react";
import type { User } from "./types";
import { formatDate } from "./utils/format";

// Wrong: CommonJS (avoid)
const React = require("react");
module.exports = { formatDate };
```
