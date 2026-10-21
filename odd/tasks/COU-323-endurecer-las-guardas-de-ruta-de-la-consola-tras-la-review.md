# COU-323 — Endurecer las guardas de ruta de la consola tras la review de COU-274

Linear: https://linear.app/countergank/issue/COU-323/endurecer-las-guardas-de-ruta-de-la-consola-tras-la-review-de-cou-274
Branch: `feature/cou-323-endurecer-las-guardas-de-ruta-de-la-consola-tras-la-review` (cut from `develop` @ `160f643`)
Feature identity: `COU-323-endurecer-las-guardas-de-ruta-de-la-consola-tras-la-review` (stable)

## Specs

**S1 — 403 anónimo**, verbatim (ticket): "**R4-403-anonymous-destination-loss** (`warning`,
resiliencia) — `src/components/error/route-error-boundary.tsx:27`: un 403 que navega a `/forbidden`
sin sesión pierde el destino al pasar por `RequireAuth`."

**S2 — Error de red ≠ denegado**, verbatim: "**R4-profile-error-forbidden** (`warning`,
resiliencia) — `src/features/authorization/components/require-permission.tsx:43-44`: un `/auth/me`
que falla por red se presenta como "sin permiso", que es exacto pero engañoso."

**S3 — Expiry con destino**, verbatim: "**Expiry sin destino** —
`src/components/session/session-expiry-bridge.tsx:20`: el redirect de sesión expirada no conserva la
ruta actual (las guardas sí lo hacen)."

**S4 — Manifiesto**, verbatim: "**R1-manifest-fallthrough** (`suggestion`, riesgo) —
`src/features/console/require-section.tsx:27-29`: una ruta sin entrada en el manifiesto no exige
permiso."

**S5 — Confiabilidad**, verbatim: "**R3-1** (`warning`, confiabilidad) —
`src/components/error/route-error-boundary.tsx:27`." · "**R3-2** (`suggestion`, confiabilidad) —
`src/features/authorization/components/require-auth.tsx:32`." · "**R3-3** (`suggestion`,
confiabilidad) — `src/features/authorization/components/require-permission.tsx:38`."

**S6 — Alcance**, verbatim: "**Fuera de alcance**: re-revisar el candidato de COU-274, y cualquier
cambio de comportamiento de las rutas públicas."

**S7 — Criterios**, verbatim: "Cada punto queda resuelto o explícitamente descartado con la razón
escrita en el PR." · "Expiry: expirar en `/app/users` y autenticarse vuelve a `/app/users` (test)."
· "`R1-manifest-fallthrough`: una ruta fuera del manifiesto sigue un criterio explícito (exigir
permiso o permitir con razón documentada) y hay test que lo fija." · "`R4-profile-error-forbidden`:
error de red y falta de permiso se distinguen en la UI (test)." · "`make ci` verde, sin regresiones
en `src/routes/guards.test.tsx` ni en `require-auth.test.tsx` / `require-permission.test.tsx`."

## Tasks

| ID | Task | Specs | Route | Commit |
|---|---|---|---|---|
| T1 | `loginDestination()` compartido; `RequireAuth` lo usa (un solo encoding) | S1, S5 | inline | f9fb7df |
| T2 | Un 403 sin sesión va a login con la ruta preservada | S1 | inline | f9fb7df |
| T3 | `usePermissions` expone `isError` + `refetch`; la guarda muestra error reintentable, no `/forbidden` | S2 | inline | 4d723ac |
| T4 | `SessionExpiryBridge` conserva la ruta al expirar | S3 | inline | f9fb7df |
| T5 | Criterio explícito y testeado para rutas fuera del manifiesto | S4 | inline | 4d723ac |
| T6 | Revisión de R3-1/R3-2/R3-3 con disposición escrita | S5 | inline | 4d723ac |
| T7 | Gate completo (`make ci`) | S7 | inline | 4d723ac |

## Log

**L1 — Pedido original**, verbatim: "vamos con kickoff"

L2 — Elección (kickoff 2.0.0): COU-323 por **continuidad** con COU-274 (lo último completado) y por
orden de trabajo — las guardas son la base de todas las secciones de consola, así que se ajustan
antes de que COU-289+ se construyan encima. Estimación 2 ya estaba fijada; sin cambios.

L3 — Ticket listo antes de la primera edición: `project` = `ui-user`, `estimate` = 2, `assignee` =
Leandro Javier Cepeda, estado `In Progress`, `branchName` no vacío.

L4 — Decisiones:

- **Un solo constructor de destino** (`src/features/auth/login-destination.ts`) para los tres
  llamadores (guarda, boundary, bridge). El riesgo concreto era el encoding: el login decodifica con
  `URLSearchParams`, así que un destino sin encodear se corta en el primer `&`. Eso cubre R3-2.
- **Anónimo + 403 → login con la ruta**, no `/forbidden`: la página de prohibido está detrás de
  `RequireAuth`, así que navegar ahí sin sesión reemplazaba el origen por `/forbidden`.
- **`isError` en `usePermissions`** en vez de leer el estado de la query en la guarda: la hook ya es
  el único lugar que conoce el perfil, y el cambio es aditivo (COU-275 sigue igual).
- **Rutas fuera del manifiesto: no exigen permiso, con razón escrita y test**. Sólo pueden ser el
  placeholder de sección, que no hace ninguna request; el test fija la regla y una sección futura
  que olvide su entrada en el manifiesto falla en `require-section.test.tsx` en vez de quedar
  desprotegida en silencio.
- **R3-1** era el mismo `if (isForbiddenError)` del boundary: cubierto por el arreglo del 403.
  **R3-3** es el `Navigate` a `/forbidden`: se revisó el riesgo de bucle y no existe porque
  `/forbidden` sólo está detrás de `RequireAuth` — queda fijado por el caso 4 de
  `guards.test.tsx` (usuario sin permisos aterriza en `/forbidden` y renderiza).

L5 — Gate local: `make ci` **EXIT=0** (Biome + ESLint, `tsc -b --noEmit`, 463 tests con el umbral
de coverage y build de producción). Primer intento falló sólo por formato de Biome en los archivos
nuevos; segundo, verde. El aviso de chunk >500 kB es preexistente.

L6 — Regla de comentarios del repo (pedida en la misma sesión): presupuesto de **3 líneas de
prosa** por comentario, documentado en `AGENTS.md` y `docs/component-patterns.md`, con decisión
explícita de no agregar un gate de CI (regla blanda). Este ticket aplicó la regla a su propio
código: los bloques de justificación de las guardas se redujeron a 3 líneas. El barrido del
código existente quedó en **COU-324** (161 bloques por encima del presupuesto en `src/`).
