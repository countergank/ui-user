# COU-273 — Session: tokens, automatic refresh and logout

Linear: https://linear.app/countergank/issue/COU-273/implementar-la-sesion-tokens-refresh-automatico-y-cierre-de-sesion
Branch: `feat/COU-273-sesion-y-refresh` (cut from `develop` @ the merge of #17)
Feature identity: `COU-273-sesion-y-refresh` (stable)

## Specs

**S1 — Scope**, verbatim: "Store de sesión con `zustand` (ya instalado) y persistencia namespaced +
versionada. Refresh proactivo antes de expirar y reactivo ante 401, con **single-flight**: N
respuestas 401 simultáneas disparan **un solo** refresh. Logout local inmediato, con llamada remota
cuando A5 esté disponible. Limpieza de la caché de queries al cerrar sesión."

**S2 — Non-goal**, verbatim: "**Fuera de alcance**: guardas de ruta (U05) y la UI de login (U12)."

**S3 — AC1**, verbatim: "Un token vencido se renueva sin que el usuario lo note."

**S4 — AC2**, verbatim: "Si el refresh falla, el usuario va a `/login` y no queda estado
inconsistente."

**S5 — AC3**, verbatim: "N respuestas 401 concurrentes disparan un único refresh (test dedicado)."

**S6 — AC4**, verbatim: "El logout limpia store y caché, y no deja tokens en el almacenamiento."

**S7 — AC5**, verbatim: "La persistencia está namespaced y versionada."

**S8 — Repo rules.** ADR-12 parity `en|es|pt` for every user-facing string; 80/80/80/80 coverage
floor; strict TDD with colocated tests; tokens-only styling; no new dependencies.

## API contract (read from `countergank/api-user` with explicit user authorization)

| Endpoint | Body | 200 response |
|---|---|---|
| `POST /auth/login` | `{ email, password }` | `{ user: {id,email,userName,name,lastName}, accessToken, refreshToken }` |
| `POST /auth/refresh` | `{ refreshToken }` | same shape; **rotates** both tokens |
| `POST /auth/logout` | `{ refreshToken }` | `{ message }`; revokes that refresh token |
| `GET /auth/me` | — (Bearer) | `{ id,name,lastName,email,role,permissions }` |

Errors: `{ statusCode, code, message }`; `UA-AUTH-002` invalid credentials, `UA-AUTH-003` locked,
`UA-AUTH-004` inactive, `UA-AUTH-009` invalid refresh token, 429 rate limit. Access token TTL 15 m,
refresh 7 d. A5 (COU-264, remote logout + revocation) is **Done**, so the remote call is available.

## Tasks

| ID | Task | Specs | Route | Commit |
|---|---|---|---|---|
| T1 | HTTP client: base URL, JSON, `AppError` mapping, Bearer injection, 401 hook | S1, S8 | inline | T1 |
| T2 | Session store: tokens + user, namespaced and versioned persistence, migrate | S1, S7 | inline | T2 |
| T3 | Access-token expiry decoding + proactive refresh timer | S1, S3 | inline | T3 |
| T4 | Refresh coordinator: single-flight, reactive 401 retry, failure clears session | S1, S3, S5 | inline | T4 |
| T5 | Logout: local (store + persistence + query cache) and remote best-effort | S1, S6 | inline | T5 |
| T6 | Expiry bridge: expired session navigates to `/login` | S4 | inline | T6 |
| T7 | Full gate + docs | S8 | inline | T7 |

## Findings

1. **There is no HTTP client in `ui-user`.** `src/features/home/api.ts` is a mock whose comment says
   a real client would live in `src/lib/api-client`. T1 creates the minimum: `fetch` plus the repo's
   `AppError`, no new dependency.
2. **Refresh rotates both tokens**, so the coordinator must persist the pair it just received;
   keeping the old one would work until the refresh expires, then break silently.
3. **The server does not revoke the old refresh token on rotation** (only on logout). Single-flight
   is therefore needed for stampede control, not for correctness of rotation — but a lost refresh
   response still leaves a valid token behind.
4. **AC2 conflicts with S2.** "El usuario va a `/login`" needs a navigation, while route guards
   (U05) and the login route (U12/COU-281) are out of scope. Resolution: the session layer exposes
   state, and a bridge in the shell navigates to `/login` when it expires; today that path renders
   the router's not-found route, and COU-281 gives it a page. The AC is satisfied without
   implementing guard logic.

## Decisions

- **Decode `exp` from the access JWT** instead of hardcoding the 15-minute TTL: the server TTL is
  configuration, and a hardcoded client timer would drift from it.
- **Single-flight as one shared promise** in the session module, cleared on settle.
- **Authoritative session key**: `countergank.ui.session`, `version: 1`, with `migrate` that drops
  unknown shapes rather than trusting them.
- **Logout is local-first**: the remote call is fired and its failure is swallowed, because the user
  must be logged out even when the network is down.
- **No new runtime dependencies**: `zustand`, `@tanstack/react-query`, `zod` and `fetch` cover it.

## Verification

`pnpm vitest run`, `pnpm lint`, `pnpm typecheck`, `pnpm test:coverage`, `pnpm build`.

## Log

**L1 — user request (verbatim):**
> ok vamos con eso y ya podemos proceder cn el siguiente ticket

and, on being offered the backlog:
> hay algun ticket para disponibilizsar login?

then, after the analysis of COU-273 vs COU-281:
> si dale

then, on being asked to read the API contract:
> ok dale leelo
