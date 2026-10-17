# COU-281 — Login page

Linear: https://linear.app/countergank/issue/COU-281/construir-la-pagina-de-inicio-de-sesion
Branch: `feat/COU-281-login` (cut from `develop` @ `5cc1563`)
Feature identity: `COU-281-login` (stable)

## Specs

**S1 — Scope**, verbatim: "Ruta `/login` con layout centrado. Formulario email + contraseña, con
estados de carga y error. Retorno al destino original (`redirect`) tras autenticarse."

**S2 — Non-goal**, verbatim: "**Fuera de alcance**: registro y verificación de email de alta."

**S3 — Design**, verbatim: "`Card` centrada (`max-w-sm`) con `CardHeader` (título + subtítulo) y
`CardContent`. `Form` + `Input` + `Label` + `Button` (full width, `disabled` + spinner mientras
`isPending`). `Alert` variante `destructive` para el error de formulario. Link a
'¿Olvidaste tu contraseña?'. Light y dark obligatorios (CV3)."

**S4 — i18n keys**, verbatim: "`auth.login.title`, `auth.login.subtitle`,
`auth.login.fields.email`, `auth.login.fields.password`, `auth.login.submit`,
`auth.login.forgotPassword`, `auth.login.errors.invalidCredentials`, `auth.login.errors.locked`,
`auth.login.errors.inactive`, `auth.login.errors.rateLimited`."

**S5 — AC1**: "Credenciales válidas guardan la sesión y redirigen al destino original o a la vista
por defecto."

**S6 — AC2**: "`UA-AUTH-002` muestra `auth.login.errors.invalidCredentials` **bajo el formulario**,
no en un campo."

**S7 — AC3**: "Cuenta bloqueada (423) muestra `auth.login.errors.locked`; cuenta inactiva muestra
`auth.login.errors.inactive`."

**S8 — AC4**: "429 muestra `auth.login.errors.rateLimited` y deshabilita el submit."

**S9 — AC5**: "El botón queda deshabilitado con spinner durante el envío: no hay doble submit."

**S10 — AC6**: "Email y contraseña tienen `label` asociado y errores con `aria-describedby`; el foco
va al primer error."

**S11 — AC7**: "Test de componente con MSW cubriendo éxito, credenciales inválidas, bloqueo y 429."

**S12 — AC8**: "Test axe sin violaciones."

**S13 — AC9**: "Las claves existen en los tres idiomas (paridad de U08)."

**S14 — Contract** (read from `api-user`): `POST /auth/login` `{ email, password }` → 200
`{ user, accessToken, refreshToken }`; errors `{ statusCode, code, message }` with `UA-AUTH-002`
(401), `UA-AUTH-003` (423 locked), `UA-AUTH-004` (401 inactive), 429 rate limit.

## Tasks

| ID | Task | Specs | Route | Commit |
|---|---|---|---|---|
| T1 | `auth` i18n namespace + the 10 keys in `en`/`es`/`pt` | S4, S13 | inline | `e6e363c` |
| T2 | Composition root: session API over the HTTP client, manager instance, `getAccessToken`/`onUnauthorized` wiring | S1, S5 | inline | T2 |
| T3 | `/login` route with a centered layout, outside the app shell | S1, S3 | inline | T3 |
| T4 | Login form: zod schema, submit, pending state, four error mappings | S3, S6, S7, S8, S9 | inline | T4 |
| T5 | Redirect to the original destination, validated same-origin | S5 | inline | T5 |
| T6 | Component tests with MSW + focus/aria + axe | S10, S11, S12 | inline | T6 |
| T7 | Full gate + docs | all | inline | T7 |

## Progress

- [x] T1 — `auth` namespace — `e6e363c`. The parity test failed first (English had the keys, `es`/`pt`
  did not), which is the RED this task can honestly produce. Then 7/7 in the i18n suite, lint 0,
  typecheck 0. The locale files were typed as `{ common }`, so their constraint had to widen too —
  the type system, not just the test, enforces that every declared namespace exists in every
  language.

## Findings

1. **The `auth` namespace does not exist.** `src/lib/i18n/resources.ts` declares
   `namespaces = ["common"]`; S4 asks for `auth.*`, so the namespace list, the resources shape and
   the three bundles all change. The parity test already covers every declared namespace.
2. **`/login` must live outside the shell.** The shell renders navigation and the skip link; a login
   gate has neither. The route becomes a sibling of the shell route.
3. **MSW is not installed.** S11 asks for MSW explicitly; it becomes a devDependency (delivery
   change, Task Size item 5). The alternative — stubbing `fetch` by hand — would satisfy the tests
   but not the ticket's stated tool.
4. **No route guard exists (U05)**, so nothing produces the original destination yet. The redirect
   reads `?redirect=` and validates it is a same-origin internal path; a missing or hostile value
   falls back to `/`.
5. **The session manager had no composition root** (disclosed at COU-273 close). T2 creates it here,
   which is where a session is first produced.

## Decisions

- **Form-level errors, not field errors**, for all four API failures: S6 says so explicitly for
  `UA-AUTH-002`, and the other three are account/rate conditions, not field validation.
- **Unknown failures** fall back to the generic `error.genericMessage` copy rather than inventing a
  new key outside S4.
- **429 disables the submit** until the component remounts: the ticket asks for disabled, not for a
  countdown, and a countdown would need a new key.
- **MSW handlers live per test file**, scoped to the `/auth/login` endpoint.

## Verification

`pnpm vitest run`, `pnpm lint`, `pnpm typecheck`, `pnpm test:coverage`, `pnpm build`.

## Log

**L1 — user request (verbatim):**
> perfecto! vamos
