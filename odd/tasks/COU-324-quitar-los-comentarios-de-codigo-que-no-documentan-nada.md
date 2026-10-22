# COU-324 — Quitar los comentarios de código que no documentan nada importante

Linear: https://linear.app/countergank/issue/COU-324/quitar-los-comentarios-de-codigo-que-no-documentan-nada-importante
Branch: `feature/cou-324-quitar-los-comentarios-de-codigo-que-no-documentan-nada` (cut from `develop` @ `160f643`)
Feature identity: `COU-324-quitar-los-comentarios-de-codigo-que-no-documentan-nada` (stable)

## Specs

**S1 — Scope**, verbatim: "Auditar los comentarios de `src/**`, `e2e/**` y `playwright.config.ts` /
`vitest.config.ts`."

**S2 — Quitar**, verbatim: "**Quitar** todo lo que: explica *qué* hace el código, narra una
decisión en varios párrafos, repite el nombre de un test, o documenta una función trivial."

**S3 — Conservar**, verbatim: "**Conservar** lo que documenta algo que se rompería en silencio:
directivas con razón (`biome-ignore`, `eslint-disable`); restricciones reales: el script pre-paint
de `index.html` que debe coincidir con `src/lib/theme/theme.ts`, claves de storage, orden de
listeners; referencias de una línea a ADR/spec (p. ej. `// ADR-13`, `// COU-275, S6`)."

**S4 — Mover**, verbatim: "Cuando el porqué sea valioso pero largo, mover el contenido a `docs/` y
dejar en el código una referencia de una línea."

**S5 — Non-goal**, verbatim: "**Fuera de alcance**: cambiar comportamiento, nombres de archivos o
tests; tocar `docs/` salvo para recibir el contenido que se mueva desde el código."

**S6 — AC1**, verbatim: "Ningún bloque de comentarios supera las 3 líneas consecutivas, salvo
directivas."

**S7 — AC2**, verbatim: "No queda ningún comentario que sólo repita lo que dice el código o el
nombre del test (revisión archivo por archivo, no `sed`)."

**S8 — AC3**, verbatim: "Las restricciones reales listadas arriba siguen documentadas (test o
comentario de una línea)."

**S9 — AC4**, verbatim: "`make ci` verde: ningún test depende de los comentarios eliminados."

**S10 — AC5**, verbatim: "El diff se revisa en slices de ~400 líneas; sin mezclar cambios de
lógica."

**S11 — Regla del repo** (`AGENTS.md` → "Comments", `docs/component-patterns.md` → "Comments"):
presupuesto de **3 líneas de prosa** por comentario, delimitadores `/**` y `*/` excluidos;
`biome-ignore`/`eslint-disable` y referencias de una línea a ADR/spec exentas.

**S12 — Hallazgos de la review de COU-323 que son de comentarios**: "`R3-comment-safety-claim` —
`src/features/console/require-section.test.tsx:1-3`", "`R3-expiry-comment-baseline` —
`src/routes/guards.test.tsx:89-90`", "`R4-section-pin-overstated` —
`src/features/console/require-section.test.tsx:75-80`".

## Tasks

| ID | Task | Specs | Route | Commit |
|---|---|---|---|---|
| T1 | Shard `src/components/**`, `src/lib/**`, `src/stores/**`, `src/routes/**` | S1-S3 | worker | aff9586 / 8e86e76 / 18c4964 |
| T2 | Shard `src/features/**` | S1-S3 | worker | pendiente |
| T3 | Shard `src/test/**`, raíz de `src/`, `e2e/**` y configs | S1-S3 | worker | pendiente |
| T4 | Los tres comentarios señalados por la review de COU-323 | S12 | worker | pendiente |
| T5 | Verificación: sólo líneas de comentario cambiadas | S5, S9 | inline | pendiente |
| T6 | Gate completo (`make ci`) | S9 | inline | pendiente |

## Log

**L1 — Pedido original**, verbatim: "ok perfecto, vamos con el ticket de limpieza completa de coments,
usa el kickoff"

L2 — Ticket listo antes de la primera edición: `project` = `ui-user`, `estimate` = 3, `assignee` =
Leandro Javier Cepeda, estado `In Progress`, `branchName` no vacío.

L3 — La regla se decidió en la sesión anterior (COU-323) como **regla blanda, sin gate de CI**, con
presupuesto de 3 líneas de prosa. Este ticket la aplica al código existente; no reintroduce el gate.

L4 — Ejecución en tres shards disjuntos por superficie de edición para poder correr en paralelo sin
pisarse, más el cierre inline de los tres comentarios que la review de COU-323 señaló. El control de
que nadie tocó lógica es mecánico: `git diff` filtrado a líneas que no son comentario debe quedar
vacío; si no, el shard se rechaza.

L5 — Resultado de los tres shards: **100 archivos** tocados, −723/+292 líneas, y el diff completo es
**sólo comentarios** (control mecánico parent-side: cada línea agregada o quitada empieza con `//`,
`*` o `/*`; si aparecía una línea de código el shard se rechazaba). Bloques de prosa >3 en `src/`:
**0** después de cerrar 5 que quedaban fuera del alcance de los shards (`src/main.test.tsx`,
`src/public-layout.test.tsx`, `src/styles/no-hardcoded-hex.test.ts`, `src/styles/tokens.test.ts` y
el bloque de shims de Radix en `src/test/setup.ts`). El escaneo inicial de 33 "violaciones" era un
falso positivo de mi propio script, que contaba el delimitador `*/` como línea de prosa.

L6 — **T4 diferido, con razón**: los dos hallazgos de la review de COU-323
(`R3-comment-safety-claim`, `R4-section-pin-overstated`) apuntan a
`src/features/console/require-section.test.tsx`, que **no existe en esta rama**: se agregó en el PR
#28, todavía sin mergear. Un worker no debe fabricar el archivo, y no lo hizo. Se aplican cuando
#28 esté en `develop` (rebase de esta rama y commit de dos líneas), o en un follow-up inmediato.

L7 — La regla (`AGENTS.md` y `docs/component-patterns.md`, secciones "Comments") tampoco está en
esta rama por la misma razón: viaja en el PR #28. Consecuencia de orden de merge: **COU-324 después
de #28**, o rebasear sobre `develop` una vez mergeado, para que la rama incluya la regla que aplica.

L8 — Entrega en 3 slices de comentarios + este commit de tracking: `8e86e76` features,
`aff9586` components/lib/stores/routes, `18c4964` harness/e2e/configs.

L9 — Tres archivos del shard C (`src/hooks/use-focus-management.ts`, `src/public-layout.tsx`,
`src/vite-env.d.ts`) quedaron fuera del `git add` del slice 3; van en un commit propio en vez de
amend, para no reescribir historia ya creada.

L10 — Integración con `develop` (`ab6eb7f`, con #28 mergeado): el `push --force-with-lease` de un
rebase limpio quedó bloqueado por la política de seguridad del harness, así que se tomó el camino
**no destructivo**: un merge de `origin/develop` dentro de la rama (commit `edd313d`) y un push
fast-forward. Los conflictos aparecieron sólo donde **ambos lados** aplicaron la misma regla
(`require-permission.tsx` y su test, `use-permissions.ts`, `require-auth.tsx` y su test,
`route-error-boundary.tsx` y su test, `session-expiry-bridge.tsx`, `routes/guards.test.tsx`): se
tomó la versión de `develop`, que ya cumple el presupuesto. El trabajo descartado al moverse la
rama local quedó en `backup/cou-324-rebased`, y el escaneo posterior confirma **0 bloques de prosa
>3** en todo `src/`.

L11 — T4 aplicado con una salvedad honesta: `R3-comment-safety-claim` se corrigió (el header de
`require-section.test.tsx` dice qué pinea el test, no una garantía que no establece).
`R4-section-pin-overstated` **no se aplica sin violar S5**: la sobreafirmación vive en el **nombre
del test** ("and that is the documented rule") y S5 prohíbe cambiar nombres de tests; queda como
follow-up de una línea.

L12 — Estado final: `develop` integrado (`edd313d`), T4 aplicado (`dfc52cd`), push fast-forward
(`dfc52cd`), PR #29 **MERGEABLE** y con CI corriendo (commitlint en verde). Causa raíz del
"no checks reported": GitHub no ejecuta workflows `pull_request` cuando el PR tiene conflictos,
porque no puede construir el merge commit.
