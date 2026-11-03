# 64-ua-error-copy

Map the API's `UA-*` error catalog to i18n copy so users never see raw backend messages.

## Specs

User request verbatim (issue #64 body):

- S1 (acceptance): "Cada `UA-*` conocido tiene copy en `es`, `en` y `pt`."
- S2 (acceptance): "Un código desconocido cae en un mensaje genérico que muestra el `traceId` copiable."
- S3 (acceptance): "Nunca se muestra el `message` crudo del backend (CV7)."
- S4 (acceptance): "Test que recorre el catálogo y verifica que no haya códigos sin mapear."
- S5 (scope): "Mapa `code` → clave i18n para el catálogo `UA-*` completo, con fallback por familia (4xx genérico, 5xx genérico)."
- S6 (scope): "`ErrorView` con acción de reintento."
- S7 (scope): "Distinción entre error de campo, de formulario y de página."
- S8 (out of scope): "el catálogo de claves de cada pantalla específica."

Notes: the issue says 29 types; `api-user`'s `error-kind.ts` now holds 32 entries (COM 5, APP 3, USR 4, RBAC 1, AUTH 11, SEC 2, EML 3, PAR 3). The ui-user catalog mirrors all 32. `login-errors.ts` keeps its screen-specific keys (S8) and stays untouched.

## Tasks

- T1 (S1, S4, S5): catalog + code→key map in `src/lib/errors/catalog.ts`, copy under `error.ua.*` in `common` ns for `es`/`en`/`pt`, plus family fallback keys and the catalog-walking parity test. Commit: 6b91f12
- T2 (S2, S3): `traceId` captured from the API envelope in `src/lib/http.ts` and carried by `AppError`; copyable traceId shown on unknown codes. Commit: 6b91f12
- T3 (S3, S6, S7): pure resolver (`field`/`form`/`page` levels) wired into `ErrorView`/route boundary; never renders raw backend `message`. Commit: this commit
- T4: full gate (`make ci` equivalent) and close-out. Commit: pending push/PR

## Log

- L1 (2026-11-02, issue #64 body): "El API define un registro de errores `UA-*` (29 tipos) en `src/common/errors/error-kind.ts` con envelope `{ statusCode, code, message, details?, traceId, timestamp }`. El `message` del backend no debe mostrarse crudo al usuario: es texto técnico y no siempre respeta el idioma activo." Scope: mapa code→clave i18n con fallback por familia, ErrorView con reintento, distinción campo/formulario/página. Fuera de alcance: catálogo de claves por pantalla.
- L2 (2026-11-02): merged PR #102 gave every request `Accept-Language`, so the API can answer in the active locale; this issue still requires client-side copy mapping because the backend `message` is technical text (S3).
- L3 (2026-11-02): implemented in commits 6b91f12 (T1+T2) and bb1093e (T3). Full gate green: 93 files / 709 tests, coverage 80%, build, lint, typecheck. T3 was delegated to a writer subagent (context backstop); it fixed the unused UA_ERROR_CODE_PATTERN leftover from T1 and biome-formatted http.ts + the three locale files (authorized as option A).
