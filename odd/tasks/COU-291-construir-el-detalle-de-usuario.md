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
| T1 | `users-detail-page.tsx`: `Card` + `<dl>`, `Badge` de rol/estado, loading, error genérico con retry, rama 404 dedicada | S1, S2, S4, S6, S8 | sin commit |
| T2 | `users-detail-route.tsx` + registro de `users/:id` en `routes/index.tsx` (`RequireSection` hereda `user:read`) | S3, S9 | sin commit |
| T3 | Icon button "ver detalle" en `users-columns.tsx` con `PERMISSIONS.userRead` | S9 | sin commit |
| T4 | Claves `users.detail.*` en es/en/pt + paridad | S7, S8 | sin commit |
| T5 | Tests: MSW 200/404/500 + axe, test de ruta y test de listado | S8, S9 | sin commit |
| T6 | Gate completo (lint, typecheck, tests, build) | S8 | en verde |

Estado: T1-T6 implementadas y verificadas. RED→GREEN observado en `src/features/users/`,
`src/routes/` y `src/lib/i18n/` (10 archivos, 104 tests). `make ci` completo en verde: Biome, ESLint,
`tsc --noEmit`, `test:coverage` con el piso de 80% y `build`. Sin commit: espera autorización del
humano.

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
