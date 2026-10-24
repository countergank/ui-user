# COU-318 — Endurecer el shell de la consola tras la review de COU-278

Linear: https://linear.app/countergank/issue/COU-318/endurecer-el-shell-de-la-consola-tras-la-review-de-cou-278
Branch: `feature/cou-318-endurecer-el-shell-de-la-consola-tras-la-review-de-cou-278` (desde `develop` @ `64ae7aa`)

## Specs

**S1 — R4-signout-await**: "la navegación espera a `sessionManager.logout()`, así que un revoke lento
se percibe como salida lenta aunque el estado local ya se limpió."

**S2 — R4-drawer-viewport**: "comportamiento del drawer en viewports de poca altura."

**S3 — R3-empty-manifest-deref**: "`activeNavItem` asume que el manifiesto no está vacío."

**S4 — R4-eager-console-shell**: "el shell de consola se importa eager; evaluar lazy/code-split."

**S5 — R1-001** (`warning`, riesgo, `dashboard-layout.tsx:29` a la fecha de la review).

**S6 — Diferido de COU-323/324**: el título del test de `require-section.test.tsx` sobreafirmaba
("and that is the documented rule"); se dejó abierto porque S5 de COU-324 prohibía renombrar tests.

## Tasks

| ID | Task | Specs | Route | Commit |
|---|---|---|---|---|
| T1 | `signOut` navega primero y el revoke va en background | S1 | inline | pendiente |
| T2 | Drawer acotado al viewport, con scroll propio | S2 | inline | pendiente |
| T3 | `activeNavItem` devuelve `undefined` con manifiesto vacío | S3 | inline | pendiente |
| T4 | Shell eager: evaluación y decisión registrada | S4 | inline | pendiente |
| T5 | Título del test corregido | S6 | inline | pendiente |
| T6 | Gate completo | all | inline | pendiente |

## Log

**L1 — Pedido original**, verbatim: "si hay hallazgos los revisamos y arreglamos a todos"

L2 — Ticket en `In Progress`, rama desde `develop` @ `64ae7aa`, estimación 2 ya fijada.

L3 — **S4 resuelto con decisión escrita, no con código**: lazy-loading del shell cambiaría el
primer frame de cada navegación a consola por una pantalla vacía, a cambio de ~40 kB en un chunk de
entrada que ya dominan las dependencias (603 kB). Se mantiene eager y se documenta; si el bundle
crece hasta que importe, el cambio queda aislado en `src/routes/index.tsx`.

L4 — **S5 no se pudo verificar**: la review de COU-278 lo señaló en `dashboard-layout.tsx:29`, pero
ese archivo cambió dos veces desde entonces (COU-289 lo reescribió). Sin el texto del hallazgo no se
puede afirmar que siga existiendo; se deja constancia en lugar de inventar un arreglo.
