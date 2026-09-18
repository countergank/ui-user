# Stack — Standard Frontend Template

## ADDED Requirements

### STACK-1: Language
The standard template MUST be written in TypeScript 5 with `strict: true` enabled in
`tsconfig.json`. (`ts-001` per react-frontend skill.)

### STACK-2: UI framework
The template MUST use React 19 as the UI framework. Server components are the default;
components become client components only when they need interactivity or state
(`react-001` per skill).

### STACK-3: Build tooling
The template MUST use Vite for the dev server and production build. It MUST configure
path aliases (`@/` → `src/`) and use the `import.meta.env` mechanism for environment
variables (`vite-001`, `vite-002` per skill).

### STACK-4: Styling
The template MUST adopt Tailwind CSS as the styling base and shadcn/ui as the component
layer (Radix UI primitives + CSS variables + CVA). The `css-responsive` rules of the
react-frontend skill (mobile-first, layout properties, breakpoints, container queries,
fluid typography, touch-friendly) MUST be honored within the Tailwind/shadcn medium.

### STACK-5: Server state
The template MUST use TanStack Query for server-state and data-fetching operations.
Independent queries MUST be fired in parallel (Promise.all / `Promise.allSettled`)
(`perf-001` per skill).

### STACK-6: Global state
The template MUST prefer local component state using React hooks and Context. A global
state library is NOT required and MUST NOT be added without documented justification.

### STACK-7: Routing
The template MUST use React Router for SPA routing. Dynamic routes MUST use React.lazy /
dynamic `import()` for code splitting per route (`bundle-001`, `bundle-002` per skill).

### STACK-8: Package manager
The template MUST use pnpm as the package manager and MUST pin the Node version via
`.nvmrc`.

### STACK-9: Accessibility baseline
The template MUST meet WCAG 2.2 AA as a baseline: semantic HTML (`a11y-001`), accessible
labels and controls, visible focus, alt text, correct `lang` attribute, keyboard
operability, and prefers-reduced-motion handling. Automated a11y checks MUST be part of
the test suite.
