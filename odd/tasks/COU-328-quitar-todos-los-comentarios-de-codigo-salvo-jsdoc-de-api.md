# COU-328 — Quitar todos los comentarios de código salvo JSDoc de API

Linear: https://linear.app/countergank/issue/COU-328/quitar-todos-los-comentarios-de-codigo-salvo-jsdoc-de-api
Branch: `feature/cou-328-quitar-todos-los-comentarios-de-codigo-salvo-jsdoc-de-api` (desde `develop` @ `408e4f4`)

## Specs

**S1 — Regla vigente** (`AGENTS.md` y `docs/component-patterns.md`, sección "Comments"): no se
permiten comentarios. La única forma admitida es JSDoc (`/** */`) sobre una API **exportada** que
documente parámetros y retorno con `@param` / `@returns` cuando la firma no lo hace obvio. Sin `//`
inline, sin banners, sin notas de porqué, sin JSDoc sobre helpers internos o triviales.

**S2 — Directivas**: `biome-ignore` y `eslint-disable` con su línea de justificación **se
conservan**; son instrucciones al linter, no prosa.

**S3 — Alcance**, verbatim (ticket): "`src/**` y `e2e/**` (el código de COU-289 se limpia dentro de
su propio ticket, no acá)."

**S4 — AC**: "No queda ningún comentario en `src/**` ni `e2e/**` salvo directivas y JSDoc de API con
`@param`/`@returns`." · "Ningún test depende de un comentario eliminado (`make ci` verde)." · "El
diff es sólo de comentarios: ninguna línea de código cambia." · "Slices de ~400 líneas, sin mezclar
áreas."

## Tasks

| ID | Task | Specs | Route | Commit |
|---|---|---|---|---|
| T1 | Shard `src/components/**` (salvo `data-list`), `src/lib/**`, `src/stores/**` | S1-S3 | worker | pendiente |
| T2 | Shard `src/features/**` | S1-S3 | worker | pendiente |
| T3 | Shard `src/routes/**`, `src/hooks/**`, `src/test/**`, `src/styles/**`, `e2e/**`, configs | S1-S3 | worker | pendiente |
| T4 | Verificación mecánica: diff sólo de comentarios + presupuesto | S4 | inline | pendiente |
| T5 | Gate completo (`make ci`) | S4 | inline | pendiente |

## Log

**L1 — Pedido original**, verbatim: "ok perfecto, usem,os kickoff y sigamos"

L2 — Elección (kickoff): COU-328 por continuidad con la regla nueva (pedida dos veces por el humano)
y porque no arrastra decisiones de producto. Estimación 3 ya fijada.

L3 — Ticket en `In Progress`, rama desde `develop` @ `408e4f4`.

L4 — Estado de partida medido: **384 líneas de prosa** (`//` y JSDoc no-API) en `src/` + 238 líneas
de `*` de JSDoc, de las cuales sólo sobreviven las que documentan API exportada. `data-list` y
`features/users` ya están limpios (COU-289 los escribió con la regla nueva).

L5 — Resultado: **119 archivos**, −843/+68. Quedan **22 JSDoc de API** con `@param`/`@returns` y
**4 directivas** con su justificación; nada más.

L6 — Dos honestidades registradas:

- El diff **no es 100% de comentarios**: al vaciar tres `catch`, el formatter los colapsó a
  `} catch {}`. Es reformateo, no cambio semántico, y se declara en el PR.
- Esos `catch` se salvaban del `no-empty` **porque tenían un comentario adentro**: el repo tenía
  reglas de lint silenciadas por prosa. Ahora llevan su directiva explícita.

L7 — Costo aceptado: la justificación del contraste AA vivía en comentarios de `tokens.css` y ahora
sólo está en el historial. La regla sigue viva por `tokens.test.ts` (mide los ratios). Si se quiere
el "por qué" escrito, su lugar es `docs/accessibility.md`.
