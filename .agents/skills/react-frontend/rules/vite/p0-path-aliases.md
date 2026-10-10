---
priority: P0
category: vite
---

# Configure Path Aliases for Clean Imports

**Do**: Define path aliases in both `tsconfig.json` and `vite.config.ts` so imports resolve consistently at compile time and runtime. Use `@/` as the root alias for `src/`.

**Avoid**: Deep relative imports like `../../../utils/helpers`. Configuring aliases in only one of tsconfig or Vite (causes mismatch between editor and bundler).

**Example**:
```ts
// vite.config.ts
import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
});

// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": { "@/*": ["src/*"] }
  }
}

// Usage
import { formatDate } from "@/utils/format";
```
