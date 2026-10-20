# COU-275 — Implementar la autorización por permisos en la UI

Linear: https://linear.app/countergank/issue/COU-275/implementar-la-autorizacion-por-permisos-en-la-ui
Branch: `feat/COU-275-autorizacion-por-permisos-ui` (cut from `develop` @ `71ad94e`)
Feature identity: `COU-275-autorizacion-por-permisos`

## Specs

**S1 — Scope**, verbatim:

> * `usePermissions()`: rol y permisos efectivos desde `GET /auth/me`.
> * `useCan(permission)`: predicado de permiso.
> * `<Can permission fallback>`: renderizado condicional.
> * Manifiesto declarativo de navegación con `requiredPermission` por ítem.
> * `ForbiddenView` (403) reutilizable.

**S2 — Non-goal**, verbatim: "Fuera de alcance: la implementación de cada acción concreta (los
tickets de cada feature la consumen)."

**S3 — AC1**, verbatim: "La navegación muestra solo los ítems cuyo permiso está presente."

**S4 — AC2**, verbatim: "`admin` (`*`) ve todo; un usuario con `user:read` no ve las secciones de
roles ni auditoría."

**S5 — AC3**, verbatim: "Las acciones de escritura se renderizan condicionalmente según permiso."

**S6 — AC4**, verbatim: "El servidor sigue siendo la fuente de verdad: un 403 inesperado se maneja
con `ForbiddenView`."

**S7 — AC5**, verbatim: "Tests de `useCan` con: permiso presente, ausente, y comodín `*`."

**S8 — Contrato del API** (COU-267, Done en `api-user`): `GET /auth/me` responde
`{ id, name, lastName, email, role, permissions[] }` con los permisos **efectivos**
(`api-user/src/auth/dto/me-response.dto.ts:17`, `api-user/src/auth/auth.controller.ts:174`).
Roles sembrados: `admin` → `['*']`, `user` → `['user:read', 'user:update']`, `viewer` →
`['user:read']` (`api-user/src/rbac/services/role.service.ts:19-40`). Catálogo de 22 permisos
`<resource>:<action>` (`api-user/src/rbac/services/permission.service.ts:12-35`). Un 403 llega
como `{ statusCode: 403, code: "UA-SEC-002" }` (`api-user/src/common/errors/error-kind.ts:173`).

**S9 — Semántica del servidor que la UI debe espejar**: el guard acepta el comodín global `*` y
el comodín de recurso `<resource>:*` (`api-user/src/auth/guards/permissions.guard.ts:44-53`).

**S10 — Secciones del manifiesto** (ADR-13, `docs/adr.md:269`): `/app` (resumen), `/app/users`,
`/app/roles`, `/app/permissions`, `/app/audit`, `/app/settings`.

**S11 — Dependencia declarada**: "Cumple CV1-CV10. Depende de A8." A8 = COU-267, ya **Done**, y
su contrato está transcripto en S8 — por eso este ticket no está bloqueado.

## Tasks

| ID | Specs | Route | Contenido |
|----|-------|-------|-----------|
| T1 | S1, S7, S9 | inline | Vocabulario de permisos + `hasPermission` puro (presente, ausente, `*`, `<resource>:*`) |
| T2 | S1, S8 | inline | Transporte `/auth/me` con esquema Zod + `usePermissions` (TanStack Query, MSW) |
| T3 | S1, S5, S7 | inline | `useCan` + `<Can permission fallback>` |
| T4 | S1, S3, S4, S10 | inline | Manifiesto declarativo + `ConsoleNav` filtrado por permisos |
| T5 | S1, S6 | inline | `ForbiddenView` + `isForbiddenError` + 403 en el boundary de rutas |
| T6 | S3-S6 | inline | i18n `console` (en/es/pt), docs y gate `make ci` |

## Decisions

- **Orden de trabajo invertido respecto de COU-278.** El 2026-10-19 el owner eligió implementar
  este ticket antes del shell del dashboard (COU-278), porque su AC de navegación filtrada
  dependía de un modelo de permisos que no existía en el cliente. La rama
  `feat/COU-278-shell-del-dashboard` se creó y se descartó sin commits.
- **`<resource>:*` sí, aunque S7 sólo nombre `*`.** Ocultar una sección que el servidor autoriza
  es un bug de renderizado: el guard de `api-user` acepta `user:*`, así que la UI tiene que
  decidir con la misma regla (S9). Un único módulo puro concentra esa semántica.
- **Permisos reales, no inventados.** El manifiesto toma los nombres del catálogo del API
  (`user:read`, `role:read`, `permission:read`, `audit:read`, `parameter:read`), verificados en
  el repo hermano con autorización del owner (L3).

## Progress

## Conventions check

CV1-CV10 no están transcriptas en este repo ni en el ticket; se cumplen las convenciones locales
que sí están escritas: Conventional Commits, tokens de diseño (sin hex ni estilos inline),
`role`-based queries en tests, axe por componente, y paridad i18n `en|es|pt`.

## Log

**L1 — user request (verbatim):**
> usa la skill kickoff

**L2 — user answer (verbatim)**, on how to satisfy the permission-filtered navigation AC while
U06 (COU-275) did not exist:
> Frenar COU-278 y hacer COU-275 antes

**L3 — user answer (verbatim)**, on reading the sibling API repository for the real permission
names:
> Sí, leé api-user en sólo lectura

**L4 — user request (verbatim)**, moving COU-310 out of the board:
> Sí, marcalo Done
