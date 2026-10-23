# COU-289 — Construir el listado de usuarios del panel admin

Linear: https://linear.app/countergank/issue/COU-289/construir-el-listado-de-usuarios-del-panel-admin
Branch: `feature/cou-289-construir-el-listado-de-usuarios-del-panel-admin` (cut from `develop` @ `64ae7aa`)
Feature identity: `COU-289-construir-el-listado-de-usuarios-del-panel-admin` (stable)

## Specs

**S1 — Ruta**, verbatim: "Ruta `/admin/users`." → **desviación aprobada**: se implementa en `/app/users`
(ver L4).

**S2 — Tabla**, verbatim: "Tabla con paginación y ordenamiento server-side."

**S3 — Filtros**, verbatim: "Filtros: búsqueda (debounce 300 ms), rol y estado."

**S4 — Acciones**, verbatim: "Acciones por fila visibles según permiso."

**S5 — Diseño**, verbatim: "`Card` con header (título + CTA "Nuevo usuario") y `Table` con header sticky."
· "Columnas: **Nombre** (`name lastName`), **Email**, **Usuario**, **Rol** (`Badge`), **Estado**
(`Badge` activo/inactivo), **Creado** (fecha local), **Acciones**." · "`Pagination` al pie; fila de
filtros arriba."

**S6 — i18n**, verbatim: "`users.list.title`, `users.list.columns.name|email|userName|role|status|createdAt|actions`,
`users.list.filters.search|role|status|clear`, `users.list.empty`, `users.list.actions.create|edit|activate|deactivate|unlock|delete`,
`users.list.status.active|inactive`."

**S7 — AC page**, verbatim: "Siempre envía `page` (mitiga el doble shape hasta A1)."

**S8 — AC sortBy**, verbatim: "`sortBy` limitado al enum del API."

**S9 — AC URL**, verbatim: "Filtros, orden y página se reflejan en la URL (link compartible)."

**S10 — AC estados**, verbatim: "Loading = skeleton de filas; empty = mensaje + CTA; error = `ErrorView`
con retry."

**S11 — AC permisos**, verbatim: "Las acciones de cada fila aparecen solo si el usuario tiene el permiso
correspondiente."

**S12 — AC tests**, verbatim: "Test de componente con MSW (éxito, vacío, error) y test axe." · "Claves
presentes en los tres idiomas."

**S14 — URL como fuente de verdad**, verbatim: "cuando armes el listado y si vamos a usar filtros y
ordenamiento y paginado, se deben sincronziar dichos filtros en la url de frontend, todo lo aplicado".

**S15 — Componentes genéricos reutilizables**, verbatim: "debe componentizarse en la medida de lo
posible de manera generica para reutilizar los componentes en otros listados".

**S13 — Contrato del API** (verificado en `api-user`, no inventado): `GET /admin/users` devuelve con
`page`: `{ data: UserDTO[], total, page, limit, totalPages }`. Sin `page` devuelve un array plano
(`api-user/src/user/controller/user.controller.ts:81-90`) — por eso S7.

`UserDTO` = `{ id, name, lastName, email, userName, role, createdAt, updatedAt, isActive, lockedUntil, failedLoginAttempts }`.

Query: `page` (≥1), `limit` (1..100, default 20), `sortBy` ∈ `name, lastName, email, userName, role, isActive, createdAt, updatedAt` (default `createdAt`), `sortOrder` ∈ `asc|desc` (default `desc`), `role` (exacto), `isActive` (`'true'|'false'`), `search`.

## Tasks

| ID | Task | Specs | Route | Commit |
|---|---|---|---|---|
| T1 | `params.ts`: query ↔ URL puros, con el enum de `sortBy` y defaults | S8, S9 | worker | pendiente |
| T2 | `api.ts` + `types.ts`: zod del paginado, `page` siempre presente | S7, S13 | worker | pendiente |
| T3 | `use-users.ts`: query con las params de la URL y `keepPreviousData` | S2, S9 | worker | pendiente |
| T4 | `users-page.tsx`: Card + filtros + tabla + paginación + estados | S2, S5, S10 | worker | pendiente |
| T5 | Acciones por fila tras `<Can>` | S4, S11 | worker | pendiente |
| T6 | Ruta `/app/users` con `RequireSection` y módulo lazy | S1 | worker | pendiente |
| T7 | i18n `users` en `en`/`es`/`pt` con paridad | S6, S12 | worker | pendiente |
| T8 | Tests: `params` puro, MSW éxito/vacío/error, URL, permisos, axe | S12 | worker | pendiente |
| T9 | Gate completo (`make ci`) | S12 | inline | pendiente |

## Log

**L1 — Pedido original**, verbatim: "listo usamos kickoff y vemos que sigue"

L2 — Elección (kickoff): COU-289 por **valor**: la consola ya tiene shell y guardas, pero ninguna
sección usable. Estimación 3 confirmada.

L3 — Ticket listo antes de la primera edición: `project` = `ui-user`, `estimate` = 3, `assignee` =
Leandro Javier Cepeda, estado `In Progress`, `branchName` no vacío.

L4 — **Desviación de ruta, aprobada por el humano**: el ticket dice `/admin/users`, pero ADR-13 fijó
la consola en `/app/*` y el manifiesto (`src/features/console/navigation.ts`) ya declara
`/app/users` con `requiredPermission: user:read`. Implementar `/admin/users` habría dejado la
sección **sin guarda de permiso** y fuera del sidebar. Se implementa en `/app/users`.

L5 — **Contrato no inventado**: con permiso explícito del humano se leyó `api-user` (sólo lectura,
`src/user/`) y se tomó el shape real de `PaginatedUserResponseDTO` y `UserDTO` (ver S13). El `zod`
del cliente lo refleja; los tests MSW usan ese shape, no uno supuesto.

L6 — Regla de comentarios vigente (`AGENTS.md`): 3 líneas de prosa por comentario, delimitadores y
directivas excluidos.

L7 — Requisito agregado por el humano con la implementación en curso (S14, S15): estado del listado
**en la URL** (nada en estado local) y capa genérica reutilizable por los listados siguientes. Se
canceló el worker que ya estaba corriendo y se relanzó con el requisito y con la superficie de
edición `src/components/data-list/**` incluida; el doc es la fuente que el worker lee.

L8 — Verificación parent-side del handoff (el worker no corre gates de repo, a propósito):

- **Lint**: 33 errores de Biome (formato/imports) y 35 de ESLint en el código nuevo. Se arreglaron en
  la raíz, sin una sola supresión: el caso interesante fue `ListParams.filters`, tipado como
  `Record<string, string>` cuando en runtime siempre fue tri-estado; tiparlo bien hizo válidos los
  guards que ESLint marcaba como redundantes.
- **Typecheck**: `es.ts` y `pt.ts` declaran su bundle con un tipo explícito y el namespace `users`
  se agregó al objeto pero no al tipo. Los tests pasaban; `tsc` no. Detectado por el gate, no por
  los tests — razón por la que el gate lo corre el orquestador.
- **Regresión de guardas**: `guards.test.tsx` asumía que `/app/users` renderizaba el placeholder;
  ahora es una ruta real. Las dos pruebas pasaron a `/app/roles` (sigue siendo placeholder), así
  siguen verificando guarda y preservación de destino en vez de la pantalla nueva.
- **Resultado**: `make ci` **EXIT=0** con 524 tests, y la ruta de usuarios sale en su propio chunk
  (`users-route-*.js`, 39.7 kB), o sea el lazy de la ruta funciona.

L9 — Límites conocidos, reportados y no silenciados:

- **Las acciones no mutan**: CTA "Nuevo usuario" y acciones de fila se muestran u ocultan según
  permiso (S4/S11, que es lo que pide el ticket) pero no tienen handler, porque las mutaciones
  necesitan su propio contrato verificado y su ticket. Recomendación pendiente del humano:
  dejarlas `disabled` con `title` hasta entonces.
- **El filtro de rol** arma sus opciones con los roles presentes en la página cargada: no hay
  endpoint de roles verificado, así que el cliente no inventa nombres. Se reemplaza cuando exista
  `GET /roles`.

## Estado al cierre de la sesión (para retomar)

- **Rama**: `feature/cou-289-construir-el-listado-de-usuarios-del-panel-admin` (desde `origin/develop` @ `64ae7aa`), con **todo el trabajo sin commitear**: 8 archivos modificados (`permissions.ts`, `routes/index.tsx`, `routes.test.tsx`, `routes/guards.test.tsx`, 3 locales + `resources.ts`) y 21 nuevos (`src/components/data-list/**`, `src/features/users/**`, `src/routes/users-route.tsx`).
- **Gate**: `make ci` **EXIT=0** con 524 tests, typecheck, lint y build; la ruta sale en chunk propio.
- **Siguiente acción exacta**: autorizar los 4 commits propuestos (capa genérica / adaptador / ruta / i18n+docs) → push → PR a `develop` con `fixes COU-289` → review nativa.
- **Pendiente de decisión humana** (no bloquea commitear, sí cerrar el ticket):
  1. Acciones de fila y CTA sin handler: ¿`disabled` + `title` o activas sin efecto?
  2. Filtro de rol derivado de la página cargada: ¿se deja así o se oculta hasta que exista `GET /roles`?
- **Fuera de alcance confirmado**: mutaciones de usuario (crear/editar/activar/desbloquear/eliminar) necesitan su ticket y contrato verificado; hoy solo se gatea su visibilidad.
- **Recordatorio de arranque**: `git status --short` para confirmar que el trabajo sigue en el árbol, `make ci` para revalidar antes de commitear.
