# COU-274 — Implementar las guardas de ruta por autenticación y permiso

Linear: https://linear.app/countergank/issue/COU-274/implementar-las-guardas-de-ruta-por-autenticacion-y-permiso
Branch: `feature/cou-274-implementar-las-guardas-de-ruta-por-autenticacion-y-permiso` (cut from `develop` @ `a3858d3`)
Feature identity: `COU-274-implementar-las-guardas-de-ruta-por-autenticacion-y-permiso` (stable)

## Specs

**S1 — RequireAuth**, verbatim: "`RequireAuth`: sin sesión redirige a `/login?redirect=<destino>`."

**S2 — RequirePermission**, verbatim: "`RequirePermission`: autenticado pero sin el permiso requerido →
`/forbidden`."

**S3 — 403 del servidor**, verbatim: "Una respuesta 403 del servidor también lleva a `/forbidden`."

**S4 — Integración**, verbatim: "Integración con el router existente y su `errorElement`."

**S5 — Non-goal**, verbatim: "**Fuera de alcance**: el hook de permisos y la navegación condicional
(U06)."

**S6 — AC1**, verbatim: "Un deep link a una ruta protegida sin sesión redirige a login y **vuelve al
destino original** tras autenticarse."

**S7 — AC2**, verbatim: "Un usuario sin el permiso requerido ve `/forbidden`, no un 404."

**S8 — AC3**, verbatim: "Tests de las cuatro combinaciones: con/sin sesión × con/sin permiso."

**S9 — AC4**, verbatim: "Las guardas no parpadean contenido protegido antes de resolver la sesión."

**S10 — Contexto**, verbatim: "El router actual (`src/routes/index.tsx`) solo tiene rutas públicas
(`/` y `/about`) bajo `AppShell`. No hay forma de proteger una ruta."

**S11 — Convenciones**, verbatim: "Cumple CV1-CV10."

**S12 — ADR-13** (la decisión que estas guardas implementan, `docs/adr.md`): "Authorization stays
server-side. `/app/*` is gated for UX and deep-link preservation; every request is still authorized
by `api-user` (ASVS V8.3.1). The UI never decides what a user may read or write."

## Tasks

| ID | Task | Specs | Route | Commit |
|---|---|---|---|---|
| T1 | `RequireAuth`: sesión ausente o expirada → `/login?redirect=<destino completo>` | S1, S6 | inline | 09d2241 |
| T2 | `RequirePermission`: sin permiso → `/forbidden`; con perfil cargando no renderiza children | S2, S9 | inline | 09d2241 |
| T3 | `/forbidden` como página real del shell de consola (no un 404) | S2, S7 | inline | 09d2241 |
| T4 | `RequireSection`: el permiso exigido sale del manifiesto de la sección actual | S2, S5 | inline | 09d2241 |
| T5 | Un 403 del servidor lleva a `/forbidden` desde el `errorElement` | S3, S4 | inline | 6228c88 |
| T6 | Integración en `src/routes/index.tsx` (`/app`, `/app/*`, `/forbidden`, `/profile`) | S4 | inline | 09d2241 |
| T7 | Tests de las cuatro combinaciones + deep link con destino completo + sin parpadeo | S8, S9 | inline | 09d2241 |
| T8 | Gate completo (`make ci`) + docs si cambia el contrato de rutas | S11 | inline | docs |

## Log

**L1 — Pedido original**, verbatim: "perfecto, ahora usa kickoff skill nuevamente para ver co nquie
seguimos"

L2 — Elección (kickoff 2.0.0, pasos 1-2): proyecto `ui-user`; COU-278 quedó **Done** al mergear el
PR #26, así que COU-274 dejó de estar bloqueado. Se eligió por **continuidad** (es la dependencia U05
que ADR-13, COU-275 y COU-278 nombran explícitamente) y por **desbloqueo** (habilita todas las
secciones de consola, COU-289…COU-303). El humano confirmó COU-274 con estimación 3.

L3 — Ticket listo antes de la primera edición: `project` = `ui-user`, `estimate` = 3, `assignee` =
Leandro Javier Cepeda, estado `In Progress`, `branchName` no vacío.

L4 — Evidencia de exploración que ajusta el trabajo real: `RouteErrorBoundary` ya renderiza
`ForbiddenView` cuando reconoce un 403 (`isForbiddenError`, COU-275 S6), y `ConsoleNav` ya filtra el
manifiesto por permisos. Faltaba la otra mitad: nada impide llegar por URL a `/app/*`, y el permiso
de una sección no se exige al resolver la ruta. `DEFAULT_REDIRECT` ya es `/app` (COU-278), así que
el login vuelve a la consola sin cambios.

L5 — Decisiones de diseño (registradas antes del cierre):

- **`RequireAuth` decide en el primer render.** El estado de sesión se hidrata de forma
  sincrónica desde storage, así que no hay frame en el que se vea contenido protegido. `expired`
  cuenta como no autenticado: sin tokens la consola no puede cargar nada.
- **El destino viaja completo** (`pathname + search + hash`) y encodeado en `?redirect=`; el
  login ya lo valida con allowlist (`safe-redirect.ts`), sin retipear esa regla.
- **`RequireSection` toma el permiso del manifiesto** en vez de declararlo otra vez en la ruta:
  una sección no puede estar oculta en el sidebar y alcanzable por URL, y la próxima sección
  (COU-289…) es una entrada de `CONSOLE_NAV`, no dos declaraciones que se pueden desincronizar.
- **Cargando ≠ denegado.** Mientras `/auth/me` está en vuelo, la guarda renderiza un `role=status`
  con `aria-busy` y **no** los children ni un veredicto: mandar a `/forbidden` a alguien que sí
  tiene el permiso sería peor que esperar.
- **403 del servidor → `/forbidden`** en el `errorElement` (S3). Esto cambia el comportamiento de
  COU-275, que renderizaba `ForbiddenView` en el lugar de la ruta: el AC de este ticket pide la
  ruta, así que el boundary navega y el test de COU-275 se actualizó a la nueva expectativa
  (la presentación sigue siendo la misma `ForbiddenView`, ahora en una página con URL propia).
- **`/forbidden` va detrás de `RequireAuth`**: quien no tiene el permiso está autenticado; un
  anónimo que aterrice ahí pasa primero por el login.

L6 — Fuera de alcance, anotado para no perderlo: `SessionExpiryBridge` (COU-273) navega a
`/login` **sin** `?redirect=`, así que una sesión que expira en vuelo pierde el destino. Las
guardas no lo cubren porque no son dueñas de ese listener; queda como candidato a follow-up.

L7 — Gate local: `make ci` **EXIT=0** (Biome + ESLint, `tsc -b --noEmit`, 457 tests con el umbral
de coverage y `vite build`). Primer intento falló por formato/lint de Biome en los archivos
nuevos: el `role="status"` del loader pedía `<output>`; se dejó el live region con un
`biome-ignore` razonado, igual que el route announcer. Nada de eso era un defecto de la lógica.

L8 — Entrega en 3 work units (autorizadas por el humano sobre el diff): `09d2241` guardas +
integración de rutas, `6228c88` 403 → `/forbidden`, y este commit de docs y tracking. El primer
slice supera las ~400 líneas porque las cuatro combinaciones se prueban sobre el router real; ahí
quedó el corte, no en la mitad de una guarda.
