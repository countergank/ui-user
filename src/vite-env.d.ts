/// <reference types="vite/client" />

/**
 * Typed env vars (VITE_ prefix only; see docs/adr.md "env handling policy"). Single source
 * of truth for readable `import.meta.env.VITE_*`; keep in sync with `.env.example` and Doppler.
 */
interface ImportMetaEnv {
  /** Base URL of the backend API the SPA talks to (per-environment in Doppler). */
  readonly VITE_API_BASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
