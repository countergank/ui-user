/// <reference types="vite/client" />

/**
 * Typed environment variables (VITE_ prefix only; see docs/adr.md "env handling policy").
 *
 * Values are baked into the bundle at build time. The set here is the single source of
 * truth for which `import.meta.env.VITE_*` variables the app may read. Keep this in sync
 * with `.env.example` and the Doppler project configs.
 */
interface ImportMetaEnv {
  /** Base URL of the backend API the SPA talks to (per-environment in Doppler). */
  readonly VITE_API_BASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
