# COU-291 — Construir el detalle de usuario

Linear: https://linear.app/countergank/issue/COU-291/construir-el-detalle-de-usuario
Branch: `feature/cou-291-construir-el-detalle-de-usuario` (desde `origin/develop` @ kickoff, `--no-track`)
Estimate: 3

## Specs

**S1 — Contrato**, verbatim: "Contrato: `GET /admin/users/:id` devuelve un `UserDTO`."

**S2 — Bloqueo**, verbatim: "Cuando A2 esté disponible, este detalle incorpora el estado de bloqueo
(`lockedUntil`, `failedLoginAttempts`)." → los dos campos ya están en `userSchema`; se muestran ya.

**S3 — Ruta**, verbatim: "Ruta `/admin/users/:id`." → **desviación**: `/app/users/:id` (ADR-13 fija la
consola en `/app/*`; `/admin` es el prefijo del API. Ver L3).

**S4 — Vista**, verbatim: "Vista de solo lectura con todos los campos del `UserDTO`."

**S5 — Enlace**: verbatim: "Enlace a edición."

**S6 — Diseño**, verbatim: "`Card` con lista de definición (término/valor)." · "Rol y estado como
`Badge`." · "Estado 404 dedicado."

**S7 — i18n**, verbatim: "`users.detail.title`, `users.detail.fields.*`, `users.detail.actions.edit`,
`users.detail.back`, `users.detail.locked`, `users.detail.failedAttempts`, `users.detail.notFound`."

**S8 — AC**, verbatim: "Muestra todos los campos del `UserDTO`." · "Con A2, muestra `lockedUntil` y
`failedLoginAttempts`." · "404 → vista dedicada, no un error genérico." · "Test con MSW (éxito, 404)
y test axe." · "Claves presentes en los tres idiomas."

**S9 — Punto de entrada** (decisión del humano, L2), verbatim: "podria accederse desde un icon button
de detalle desde la tabla de listado de usuarios ... sea en una pagina nueva".

**S10 — Convenciones**, verbatim: "Cumple CV1-CV10. Depende de U06, U07, U09 y U10." → ni `CV#` ni
`U##` están mapeados a tickets en este repo (solo aparecen como referencia en el texto de los
tickets). `U06` fue COU-275 en `odd/tasks/COU-278-*.md`; las cuatro dependencias ya están `Done`:
U06=COU-275, U07=COU-279 (TanStack Query), U09=COU-271 (primitivas shadcn), U10=COU-270 (sistema de
diseño).

**S11 — Solo lectura**: la página no expone acciones de mutación. Activación (COU-293), desbloqueo
(COU-294) y eliminación (COU-295) son tickets aparte.

## Tasks

| ID | Task | Specs | Commit |
|---|---|---|---|
| T1 | `users-detail-page.tsx`: `Card` + `<dl>`, `Badge` de rol/estado, loading, error genérico con retry, rama 404 dedicada | S1, S2, S4, S6, S8 | b89a251 |
| T2 | `users-detail-route.tsx` + registro de `users/:id` en `routes/index.tsx` (`RequireSection` hereda `user:read`) | S3, S9 | b89a251 |
| T3 | Icon button "ver detalle" en `users-columns.tsx` con `PERMISSIONS.userRead` | S9 | b89a251 |
| T4 | Claves `users.detail.*` en es/en/pt + paridad | S7, S8 | b89a251 / 849da4c |
| T5 | Tests: MSW 200/404/500 + axe, test de ruta y test de listado | S8, S9 | b89a251 / 849da4c |
| T6 | Gate completo (lint, typecheck, tests, build) | S8 | en verde (local y CI) |

Estado: T1-T6 implementadas, verificadas y commiteadas en cinco cortes —
`b89a251` (feature), `583bb28` (proxy de desarrollo), `940ae39` (sistema de diseño y direcciones),
`849da4c` (corrección del detalle stale), `7eaff87` (constantes de dev). `make ci` completo en verde
local y en el CI del PR #37 (commitlint, quality-gates, preview build, e2e). Revisión nativa RDD:
dos rondas, ambas aprobadas sin bloqueantes.

## Log

**L1 — Pedido original**, verbatim: "arrancá con kickoff para COU-293"

**L2 — Decisión del humano**: el selector de alcance se canceló y el pedido fue entender el trabajo
antes de estimar: "cancele pórque necesito saber de que hablamos realmente, que hariamos en este
ticket realmente". Con el terreno explicado, eligió COU-291 primero ("Primero COU-291") y confirmó
el punto de entrada y la página nueva: "podria accederse desde un icon button de detalle desde la
tabla de listado de usuarios y ahi si mostrar el listado, sea en una pagina nueva como el ticket lo
haya propuesto". Estimación **3** confirmada (igual que COU-289/290/292).

**L3 — Desviación de ruta**: el ticket dice `/admin/users/:id`; ADR-13 y el manifiesto de navegación
fijan la consola en `/app/*` (`src/routes/index.tsx:40-42`), así que se implementa `/app/users/:id`.
`activeNavItem` ya resuelve `/app/users/42` a la sección `nav.users` (`navigation.test.ts:11`), de
modo que `RequireSection` hereda `user:read` sin cambios.

**L4 — Terreno leído antes de estimar** (nada se rehace): `fetchUser` (`api.ts`) valida `GET
/admin/users/:id` con `userSchema`; `useUser` + `userQueryKey` ya existen (los construyó COU-292 para
el prefill); `AppError.status` (`src/lib/errors.ts`, seteado en `http.ts:53`) permite distinguir 404
de un error genérico. `Card`, `Badge`, `Alert`, `ErrorView` y el patrón de loading con `role="status"`
están disponibles (`users-edit-page.tsx`).

**L5 — Lectura de L2**: "ahi si mostrar el listado" se interpreta como "ahí sí mostrar el detalle":
el detalle va en una página nueva (lo que el ticket propone), no como listado embebido ni panel
lateral.

**L6 — Desbloqueo del alcance de COU-293**: COU-293 pide la acción "desde el listado y desde el
detalle"; el detalle no existía. Este ticket lo crea, y COU-293 se retoma después con las dos
superficies disponibles. El listado ya renderiza activar/desactivar `disabled` como placeholder
(decidido en COU-289).

**L7 — Dos claves agregadas al contrato de i18n de S7** (la implementación no vive sin ellas):
`users.detail.loading` para el estado de carga y `users.list.actions.view` para el icon button de
S9 (S7 solo lista `detail.actions.edit`, la acción *dentro* del detalle). El resto de S7 se
implementó tal cual, más `detail.fields.*` para los once campos del `UserDTO`: `id, name,
lastName, email, userName, role, status, createdAt, updatedAt`, con `detail.locked` y
`detail.failedAttempts` como términos propios, tal como el ticket los nombra.

**L8 — Decisiones de implementación**: (a) el 404 se detecta con `AppError.status === 404` y
renderiza una sección propia, sin `role="alert"` y sin retry, para no confundirlo con el error
genérico que sí reintenta; (b) el enlace a edición va en `Can permission={user:update}`, igual que
en el listado, para no ofrecer una acción que termina en `/forbidden`; (c) el live region de carga
usa `<output>` (rol implícito `status`) en lugar de `<p role="status">`, que exigía una supresión
de Biome; (d) `lockedUntil` se muestra como fecha, y `—` cuando es `null`: el detalle muestra el
dato del API sin reinterpretar el vencimiento.

**L9 — Tests que cambiaron por contrato**: `src/routes/routes.test.tsx` suma `users/:id` al orden
esperado de rutas hijo de `/app` (ese orden es lo que el test vigila desde COU-289); en
`users-page.integration.test.tsx` el caso `user:read` ahora exige que el enlace de detalle **sí**
esté visible mientras las mutaciones siguen ocultas: ver el detalle es lectura.

**L10 — Iteración visual pedida por el humano**, verbatim: "lo veo bien en general, solamente que
mejoraria un poco visualmente esa pantalla, que propuestas hay?". Se sincronizó el sistema de diseño
del proyecto (`design/system.md`, `design/system.html`, fuentes: `src/styles/tokens.css` y
`tailwind.config.js`) y se escribieron tres direcciones en `design/users-detail/`:
`01-identity-header.html` (identidad + secciones agrupadas), `02-dense-grid.html` (grilla densa) y
`03-section-rail.html` (riel de secciones + banda de estado). Las tres son alternativas: no hay
artboard elegido todavía. Tema claro y copy en español. Observación registrada en el sistema: los
tokens `--success`, `--warning` e `--info` existen y hoy no se usan; los estados de entidad se
pintan con `default`/`outline`.

**L11 — Estrategia de entrega**: el PR lleva tres commits como tres cortes de revisión.
(1) `feat(users)`: página, ruta, icon button, i18n ×3, tests y este documento — 561 líneas
autoradas, por encima del ideal de ~400 porque el documento ODD, los tests y las tres
traducciones son el mismo comportamiento y separarlos rompería la verificabilidad.
(2) `chore(dev)`: proxy y base relativa en desarrollo, sin relación con la feature salvo que fue
el desbloqueo necesario para verificarla contra la API real. (3) `docs(design)`: sincronización del
sistema de diseño y las tres direcciones visuales, propuestas y no código de producción; ningún
artboard está elegido todavía. Revisión sugerida: commit por commit, no el diff completo.

**L12 — Disposición de los hallazgos del review nativo** (`review-924bf1c97e398725`, aprobado con
11 advisory y cero bloqueantes). Con cambios:

- `R4-stale-detail-after-404-refetch` (WARNING, resilience): **defecto real y corregido**. El bloque
  de detalle se renderizaba con solo mirar `user.data`, mientras el 404 se decidía con
  `user.error`; TanStack Query conserva el `data` anterior cuando falla un refetch, así que un 404
  posterior dejaba la vista 404 y el detalle viejo en pantalla. Ahora la condición es
  `user.data && !notFound`, con test que lo fija y RED verificado quitando el fix.
- `R2-1` y `R3-002` (dos WARNING, mismo origen): **refutados**. Afirmaban que
  `server.listen({ onUnhandledFrame: "error" })` nombra una opción inexistente y que la correcta es
  `onUnhandledRequest`. El MSW instalado es 3.0.3, y en v3 la opción se llama exactamente
  `onUnhandledFrame`: lo documenta su propio tipo (`node_modules/msw/lib/_chunks/shared-options.d.ts`,
  `@example server.listen({ onUnhandledFrame: 'error' })`). El reviewer aplicó la API de MSW v2. El
  cambio propuesto se aplicó y `tsc` lo rechazó con TS2353; se revirtió y la guarda original queda
  intacta. Lección: un hallazgo inferencial sobre una API de terceros se verifica contra los tipos
  instalados antes de tocar el código.
- `R2-5` (SUGGESTION): el estado del detalle leía `list.status.*`. Se agregaron
  `detail.status.active|inactive` en es/en/pt.
- `R2-6` (SUGGESTION): el control "Volver al listado" estaba escrito dos veces; extraído a
  `BackToList`.
- `R2-2` (SUGGESTION): `vite.config.ts` usaba `3000` para dos servicios distintos; ahora son
  `DEV_SERVER_PORT` y `DEFAULT_API_TARGET`. La convención del repo prohíbe comentarios, así que el
  nombre de la constante carga el significado.

Sin cambios, con razón:

- `R3-001` (WARNING): el script `dev` asigna `VITE_API_BASE_URL=/` inline y eso es POSIX. Se acepta
  y se documenta en README: la alternativa es una dependencia nueva (cambio de stack, requiere
  ADR) o un archivo de entorno, que la política de seguridad de la herramienta bloquea.
- `R1-vite-proxy-loop` (SUGGESTION): el lazo sólo ocurre si el API está caído **y** Vite toma el
  mismo puerto; se resuelve con política de puertos, no con código. Documentado en README.
- `R2-3` (SUGGESTION, `design.json`): el formato del manifiesto lo define la skill de diseño y no
  tiene campo libre para documentar la convención de rutas.
- `R2-4` (SUGGESTION, tokens duplicados en los artboards): el HTML autocontenido es regla dura de la
  skill, así que la duplicación es obligatoria.
- `R1-detail-page-rendering` (SUGGESTION): confirma que no hay inyección; sin defecto.

El recibo de aprobación **no se consumió**: al pedir el acknowledgement el target ya había cambiado
porque el checkout pasó a otra rama, y native respondió `native-approved-acknowledgement-not-current`
con `mutation_performed: none`. Este commit es, por lo tanto, trabajo nuevo para esa lineage.

**L13 — Segunda ronda de revisión** (`review-2ab3bb1f9c77b640`, aprobada, 8 advisory, 4 WARNING;
autoridad quemada con `gentle-ai.review-acknowledged/v1`). Los runs se hicieron slot por slot porque
el intento en grupo terminó una corrida del lens `readability` (`pi-failed`, sin admitir nada). El
store de una lineage consumida no conserva el texto de los hallazgos, así que cada cita se verificó
contra el código. Con cambio:

- `R2-detail-status-test-uses-list-key` y `R3-status-key-mismatch-in-test` (WARNING + SUGGESTION):
  **reales**. El test seguía afirmando `list.status.active|inactive` mientras la página ya renderiza
  `detail.status.*`; pasaba sólo porque el copy coincide en los tres idiomas. Corregidas las dos
  afirmaciones.
- `R2-odd-delivery-state-contradictory` (WARNING): **real**. La tabla de tareas decía "sin commit" y
  el párrafo de estado decía "espera autorización del humano" cuando ya había cinco commits.
  Actualizados con sus SHA.

Sin cambio, con razón:

- `R3-vite-proxy-self-loop` (WARNING, segunda vez): el lazo requiere que la API esté caída **y** que
  Vite tome el mismo puerto que el target del proxy. Se resuelve con política de puertos (por
  ejemplo, fijar el dev server en 3001 con `strictPort` y la API en 3000), que es una decisión de
  convención del equipo, no un arreglo mecánico.
- `R3-dev-script-posix-only` (WARNING, repetido de la ronda 1): sigue aceptado y documentado.
- `R1-dev-proxy-credential-passthrough` y `R1-backend-enforcement-detail` (SUGGESTION): el proxy de
  desarrollo reenvía los headers de autenticación al target, que es su función; la autorización real
  es del API y la UI no la reemplaza.
- `R4-001` (WARNING, resilience, `users-detail-page.tsx:69-78`): **no verificable**: su texto no se
  pudo recuperar del store y la cita cubre el bloque de error con retry y el inicio del bloque de
  datos, que ya tienen prueba. Queda como follow-up si vuelve a aparecer.
