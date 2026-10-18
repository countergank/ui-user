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
| T2 | Composition root: session API over the HTTP client, manager instance, `getAccessToken`/`onUnauthorized` wiring | S1, S5 | inline | `7b89843` |
| T3 | `/login` route with a centered layout, outside the app shell | S1, S3 | inline | `950c3a4` |
| T4 | Login form: zod schema, submit, pending state, four error mappings | S3, S6, S7, S8, S9 | inline | `a205742` |
| T5 | Redirect to the original destination, validated same-origin | S5 | inline | `f3c985f` |
| T6 | Component tests with MSW + focus/aria + axe | S10, S11, S12 | inline | `7df0aab` |
| T7 | Full gate + docs | all | inline | (this commit) |

## Progress

- [x] T1 — `auth` namespace — `e6e363c`. The parity test failed first (English had the keys, `es`/`pt`
  did not), which is the RED this task can honestly produce. Then 7/7 in the i18n suite, lint 0,
  typecheck 0. The locale files were typed as `{ common }`, so their constraint had to widen too —
  the type system, not just the test, enforces that every declared namespace exists in every
  language.
- [x] T7 — Gate and docs. `make ci` (lint + typecheck + test:coverage + build) exits 0: 390 tests in
  55 files, coverage 98.23 lines / 95.72 branches / 92.1 functions, and `/login` builds as its own
  lazy chunk (52.30 kB / 18.62 kB gzip) instead of riding the entry bundle. `docs/testing.md` gained
  the API-component level and `docs/folder-structure.md` the `auth` feature.
- [x] T5 — Redirect — `f3c985f`. RED first (the guard module missing, and no navigation at all).
  Then 8/8 for the allowlist (internal path with query and hash kept; absolute, protocol-relative,
  backslash, scheme and control-character values all fall back) and 4/4 through real routes:
  requested destination, default view, never a hostile one, and no navigation after a failure.
- [x] T6 — MSW component suite — `7df0aab`. `msw` 3.0.3 added as a devDependency (authorized; MSW 3
  renamed `onUnhandledRequest` to `onUnhandledFrame`, and it warns against vitest's declared
  `msw@^2` peer without affecting these tests). 6/6 with the real page, client and runtime: success
  stores the session, `UA-AUTH-002` renders under the form with the fields untouched, 423 locked,
  429 rate-limited with the submit disabled, field errors described by `aria-describedby` with the
  focus on the field, plus an axe pass over both the field-error and the form-error states.
  Coverage after T6: 98.23 lines / 95.72 branches / 92.1 functions.
- [x] T4 — Login form — `a205742`. RED first (three modules missing), then 23/23 in
  `src/features/auth/`: localized field errors wired through `aria-describedby` with the focus on
  the first invalid field, a form-level alert under the form for all four API failures (never on a
  field), the generic fallback, the session stored on success, and a disabled + `aria-busy` +
  spinner submit while pending and after a 429.
- [x] T3 — `/login` route — `950c3a4`. RED first on both files (the route module and the page did
  not exist, and the router had no `/login` entry). Then 3/3 page tests and 4/4 route tests: one
  level-1 heading, its own `<main>`, and none of the shell's banner/contentinfo/navigation/skip
  link. The composition root now also delegates `fetch` instead of capturing it, so a late
  replacement (MSW later, a polyfill in the browser) is honoured by the singleton.
- [x] T2 — Composition root — `7b89843`. RED first on two fronts: the two new modules did not exist
  (10 tests could not even import), then the proactive-refresh wire was missing (3 failures).
  10/10 in the two new suites, 37/37 across `src/lib/session/`, 348/348 for the whole repo, lint 0,
  typecheck 0.

## Delivery

Authored changed lines since `origin/develop`: **546 insertions / 7 deletions** after T2, i.e. the
feature is already past the ~400-line review budget and T3-T7 are still ahead. Slice boundary
recorded here so the strategy is a decision, not an accident:

- **Slice 1** (already committed, `e6e363c..7b89843`): T1 + T2 — the i18n namespace and the session
  runtime. Self-contained: neither depends on a login page, and both are green on their own.
- **Slice 2** (planned): T3 + T4 + T5 — route, form, redirect.
- **Slice 3** (planned): T6 + T7 — MSW component tests and the closing gate/docs.

Strategy: **`single-pr`** — chosen by the user on 2026-10-17 from the oversized-delivery menu
(explicitly the least recommended option, accepted). The slice boundary above stays recorded as
the commit order inside that PR; no chain strategy applies and the prompt is not repeated. Nothing
is pushed and no PR is opened before an explicit OK.

## Findings

0. **MSW 3 ships `onUnhandledFrame`, not `onUnhandledRequest`.** A silent unhandled request would
   turn a broken wire into a passing test, so the option is explicit; the version is pinned in
   `package.json` and recorded here because it is newer than the peer range vitest declares.
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
6. **A module-level singleton captures `fetch` at import time**, which silently defeats any
   interceptor installed later — MSW being the one this feature needs in T6. The runtime keeps its
   injectable `fetchImpl`, and the shipped singleton passes a delegating wrapper instead of the
   bare global, so the lookup happens per request.
7. **Nothing ever called `scheduleProactiveRefresh`.** COU-273 shipped the timer and its tests, but
   the only production caller would have been a composition root that did not exist. T2 wires it as
   a store subscription, so a login, a rotation and a logout each reschedule or cancel it without
   the login form knowing the timer exists.

## Decisions

- **Three validation keys beyond S4** (`emailRequired`, `emailInvalid`, `passwordRequired`). S10
  requires field errors described by `aria-describedby`; S4 enumerates only the four API errors, so
  the field copy had to be added. Parity (S13) covers them in the same test.
- **The schema is a factory taking `t`.** `FormMessage` renders zod's message verbatim and that
  string is what `aria-describedby` points at, so the messages must be localized at build time of
  the schema, not translated at render.

- **Form-level errors, not field errors**, for all four API failures: S6 says so explicitly for
  `UA-AUTH-002`, and the other three are account/rate conditions, not field validation.
- **Unknown failures** fall back to the generic `error.genericMessage` copy rather than inventing a
  new key outside S4.
- **429 disables the submit** until the component remounts: the ticket asks for disabled, not for a
  countdown, and a countdown would need a new key.
- **MSW handlers live per test file**, scoped to the `/auth/login` endpoint.
- **The 401 hook reaches the manager lazily**, through a closure resolved when a 401 arrives. The
  manager needs the client (through the session API) and the client needs the manager's decision:
  a module-level import in either direction would be a load cycle. Deferring the lookup keeps the
  dependency one-way in the module graph and still gives the client the manager instance.
- **The runtime is a factory plus one instance.** `createSessionRuntime(fetchImpl?)` exists so the
  wiring is provable with a stub instead of a global `fetch`, which a module-level singleton would
  have captured before any test could replace it.

## Verification

`pnpm vitest run`, `pnpm lint`, `pnpm typecheck`, `pnpm test:coverage`, `pnpm build` — all run
through `make ci` at T7, exit 0.

Spec coverage, by task: S1/T3-T5, S2 (nothing built outside scope), S3/T3-T4, S4+T13 parity/T1,
S5/T4-T5, S6-S9/T4 and the MSW suite, S10-S12/T4 and T6, S13/T1 parity test, S14/T2 and T4.

Differential check: the only pre-existing behavior this feature touches is the router (a new
sibling route) and the app boot (one extra subscription). Their unchanged tests
(`routes.test.tsx` home/about cases, `main.test.tsx`) still pass against the new code, so neither
existing route nor the bootstrap changed behavior.

## Log

**L1 — user request (verbatim):**
> perfecto! vamos

**L2 — user request (verbatim), resume on 2026-10-17:**
> Retomá COU-281 en /home/leandrojaviercepeda/countergank/ui-user.
>    Leé odd/tasks/COU-281-login.md hasta ## Log antes de tocar nada.
>    T1 está commiteado en feat/COU-281-login (e6e363c); seguí por T2.
>    Antes de instalar msw (T6) pedime autorización. No pushees ni abras PR sin mi OK.

Constraint carried forward: MSW needs explicit authorization before `pnpm add -D msw`, and push/PR
stay user decisions.

**L4 — native review (RDD on), lineage `review-a63d58e7b600b114`:** assess reported
`reviewDue: true` (`high_risk`, auth hot path), the three-lens review (`risk`, `resilience`,
`reliability`) over the frozen base-diff candidate closed **approved**, and its authority was
acknowledged and burned. Six non-blocking findings, all `informational` — no correction was opened:
`R3-429-no-recovery` (login-form.tsx:132, the deliberate 429 decision), `R3-msw-peer-outside-range`
(package.json:79), `R3-redirect-unmatched-path` (safe-redirect.ts:40-45, the `/forgot-password`
link S3 asks for), `R4-001` WARNING (api.ts:19-21), `R4-002` (login-form.tsx:44-49), `R4-003`
(login-form.tsx:126-130). They are follow-up work, not defects in this ticket's scope.

**L3 — delivery decisions (2026-10-17), selected in the oversized-delivery menu:**
- Delivery: `delivery_strategy=single-pr` — "Un solo PR (menos recomendado)". Overrides the
  chaining path; no chain prompt is repeated.
- MSW: authorized — "Sí, instalá msw cuando llegue T6". A new devDependency is a delivery change
  (Task Size item 5) and is executed only in T6.
