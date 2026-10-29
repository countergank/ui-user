# COU-345 — Refactorizar design/ y retirar los diseños históricos

Ticket: [COU-345](https://linear.app/countergank/issue/COU-345/refactorizar-design-y-retirar-los-disenos-historicos) · Proyecto `ui-user` · Estimación 2 · Rama `feature/cou-345-refactorizar-design-y-retirar-los-disenos-historicos`

## Specs

**S1.** `design/` queda con una sola convención y tres entradas.

> "- [ ] `design/` contiene solo `README.md`, `app/` y `system.md`. Nada más."

**S2.** Se retira `design/users-detail/`; su reemplazo es el artboard del detalle nuevo.

> "Retirar `design/users-detail/`: exploración de COU-291 ya implementada; su reemplazo es `design/app/05-detalle-usuario.html`."

**S3.** Se retira `designs/`, la convención plural heredada.

> "Retirar `designs/` (convención plural heredada): `designs/identity/index.html`."
> "- [ ] `designs/` ya no existe."

**S4.** Ninguna referencia viva apunta a los paths retirados.

> "- [ ] Ninguna referencia viva apunta a `design/users-detail/` ni a `designs/identity/`."

**S5.** `docs/design-system.md` deja de declarar el boceto de marca como fuente de los valores.

> "Corregir `docs/design-system.md`: la fuente de los valores es `src/styles/tokens.css`; `design/` es el inventario, no la fuente."
> "- [ ] `docs/design-system.md` y `design/system.md` no se contradicen, y ambos coinciden con `src/styles/tokens.css`."

**S6.** `design/system.md` sigue describiendo la paleta vigente en código, con puntero explícito a la propuesta.

> "`design/system.md` **debe** seguir describiendo los tokens actuales hasta que COU-344 aplique la propuesta. Adelantarlo reintroduce la contradicción que este ticket elimina."

**S7.** `design/README.md` es el índice: estado de cada carpeta y archivo, fuente de verdad, y estado explícito de `design/app/`.

> "Nuevo `design/README.md`: índice con el estado de cada carpeta y archivo, y la fuente de verdad."
> "- [ ] `design/README.md` declara explícitamente que `design/app/` está **propuesto y no implementado**, y cuál es la landing canónica."

**S8.** `design/app/design.json` gana el bloque `source` que ata el snapshot publicado al master editable.

> "- [ ] `design/app/design.json` incluye un bloque `source` con `fig` (nombre del archivo), `sha256`, `sizeKb`, `exportedAt` y `tool` (versión del CLI de OpenPencil)."

**S9.** El flujo de re-export queda escrito en el índice.

> "- [ ] `design/README.md` documenta el flujo de re-export: editar el `.fig` → `openpencil export` → actualizar `source.sha256` → commit. Verificar con `sha256sum`."

**S10.** `design/system.html` se retira: es redundante con el `.md`.

> "`design/system.html` se retira si queda redundante con el `.md`."

**S11.** La columna Commit del ODD de COU-342 registra el merge del diseño.

> "- [ ] La columna Commit de esa tabla registra `4ecbf28` (merge de PR #38 en develop), y el Log anota que el diseño entró por ese merge."

**S12.** El gate del repo queda en verde.

> "- [ ] `npm run lint` y `npm run typecheck` en verde."

## Tasks

| ID | S# | Qué | Path | Commit |
|---|---|---|---|---|
| T1 | S7, S9 | Escribir el índice de `design/` con estado, fuente de verdad y flujo de re-export | `design/README.md` | `fbaed17` |
| T2 | S2, S3, S10 | Retirar `design/users-detail/`, `designs/` y `design/system.html` | `design/`, `designs/` | `fbaed17` |
| T3 | S6 | Puntero explícito a la propuesta no aplicada, sin tocar los valores vigentes | `design/system.md` | `fbaed17` |
| T4 | S5 | Corregir la fuente de verdad y las referencias muertas | `docs/design-system.md` | `fbaed17` |
| T5 | S8 | Agregar el bloque `source` con `sha256` calculado sobre el `.fig` real | `design/app/design.json` | `fbaed17` |
| T6 | S11 | Registrar `4ecbf28` en la tabla y el Log de COU-342 | `odd/tasks/COU-342-diseno-dashboard.md` | `fbaed17` |
| T7 | S12 | `npm run lint` + `npm run typecheck`, y revisión de referencias vivas | n/a | `fbaed17` |

## Log

**L1** — Pedido original (verbatim):

> "Sos la sesión que lleva el desarrollo de ui-user. Arrancá con la skill kickoff
> (.agents/skills/kickoff/SKILL.md) y tomá el ticket COU-345, que ya está desbloqueado.
>
> CONTEXTO
> - El PR #38 está mergeado en develop como 4ecbf28: el diseño del rebranding ya está
>   versionado en design/app/ (7 artboards HTML, design.json, tokens-app.css,
>   palette.json, fonts/).
> - COU-342 (diseño) está Done.
> - COU-345 es el paso PREVIO al rebranding. COU-344 (implementación) sigue bloqueado
>   hasta que cierres COU-345.
>
> TICKET
> COU-345 — Refactorizar design/ y retirar los diseños históricos
> https://linear.app/countergank/issue/COU-345/refactorizar-design-y-retirar-los-disenos-hist
> oricos
> branchName: leelo del ticket, no lo escribas a mano
> (feature/cou-345-refactorizar-design-y-retirar-los-disenos-historicos)
>
> QUÉ TIENE QUE QUEDAR
> 1. design/ con una sola convención: README.md (índice con el estado de cada carpeta
>    y la fuente de verdad), app/, system.md. Nada más.
> 2. Retirar design/users-detail/ (exploración de COU-291, reemplazada por
>    design/app/05-detalle-usuario.html) y designs/ (convención plural heredada,
>    designs/identity/index.html).
> 3. Corregir docs/design-system.md: la fuente de valores es src/styles/tokens.css,
>    no designs/identity/index.html. Hoy contradice a design/system.md.
> 4. design/app/design.json gana un bloque "source" con fig, sha256, sizeKb,
>    exportedAt y tool. El .fig está en
>    MEGA/Professional/Countergank/designs/Dashboard User UI.fig (Windows, fuera del
>    repo). El sha256 se calcula, no se inventa.
> 5. La columna Commit del ODD de COU-342 (odd/tasks/COU-342-diseno-dashboard.md)
>    registra 4ecbf28.
>
> GUARDRAILS
> - design/system.md sigue describiendo los tokens ACTUALES (violeta 262 83% 58%).
>   La paleta nueva está propuesta en design/app/tokens-app.css y NO se aplica en
>   este ticket: adelantarla reintroduce justo la contradicción que hay que eliminar.
> - No tocar src/. Si algo parece requerir código, pertenece a COU-344.
> - El .fig no se versiona. Flujo: editar el .fig → re-exportar los HTML → actualizar
>   source.sha256 → commit.
> - Rama desde origin/develop con --no-track y el branchName exacto de Linear.
> - No commitees sin autorización explícita: mostrá git status --short y
>   git diff --stat, proponé el mensaje y esperá. El repo tiene hook
>   (GIT_COMMIT_APPROVED=1) y commitlint: cuerpo con líneas ≤100 caracteres, sin
>   trailers de IA.
> - Antes de cerrar: npm run lint y npm run typecheck en verde.
>
> DESPUÉS
> COU-344 (rebranding) queda listo, con el inventario de las 7 pantallas
> implementadas, sus artboards y las consideraciones de los diseños históricos."

**L2** — Kickoff: `COU-345` verificado (proyecto `ui-user`, estimación 2, asignado a Leandro
Javier Cepeda, `branchName` presente), estado movido a `In Progress`, rama creada desde
`origin/develop` con `--no-track`.

**L3** — Evidencia del master editable. El `.fig` está fuera del repo, en
`<ruta al master .fig dentro de la carpeta MEGA del proyecto>`
(MEGA montado sobre el `C:\` de Windows). Se leyó solo para calcular `sha256`
(`87845c1af89c182baaee211072402f0a750a82cf9f9d7a4f127754505ae3476d`) y `sizeKb`
(272219 bytes = 265.8 KiB); no se copió al repositorio. `tool` es la versión del CLI
instalado: `openpencil 0.15.1`.

**L4** — `exportedAt` se deriva de la fecha del commit que introdujo los artboards
(`4ecbf28`, 2026-10-28), no del `mtime` del `.fig`: el `.fig` se publicó copiándolo desde la
ruta que escribe el MCP (L6 de COU-342), así que su `mtime` marca la copia, no la exportación.
El bloque `source` ata el snapshot al master *de ahora en adelante*: no existe forma
machine-verifiable de probar que el `.fig` actual corresponde a los HTML ya exportados, y ese
es justamente el hueco que este ticket cierra.

**L5** — `design/system.html` se retira: replicaba en HTML los mismos valores del `.md` ya
presentes en `src/styles/tokens.css`, con la misma paleta violeta, y ninguna referencia viva
lo consumía (la única mención restante es el Log histórico de COU-291, que se deja intacto:
es evidencia, no un puntero).

**L6** — Los Log de tickets cerrados (`COU-291`, `COU-342`) siguen mencionando
`design/users-detail/` y `designs/` porque registran lo que se hizo en su momento. Se
consideran historia, no referencias vivas; reescribirlas falsificaría el registro.

**L7** — Evidencia de cierre. `npm run lint` (biome 237 archivos + eslint) y
`npm run typecheck` (`tsc -b --noEmit`) verdes, exit 0. Barrido de referencias: los únicos
restos de `design/users-detail/`, `designs/identity/` y `design/system.html` son Logs
históricos (COU-270, COU-291, COU-342) y el registro de retiro de `design/README.md`.
Verificación de S5/S6 por script: los 21 tokens de tabla de `design/system.md` coinciden con
`src/styles/tokens.css` (0 diferencias) y los valores clave de `docs/design-system.md`
(`--primary`, `--ring`, `--muted-foreground`, `--destructive`, `--success`, `--danger`) siguen
en violeta; la paleta propuesta no se adelantó. `src/` sin cambios.

**L8** — Commit `fbaed17` (`docs(design): retire historical designs and pin the fig master`),
13 archivos, 338 inserciones y 2831 borrados. El diff supera el slice de ~400 líneas
autoradas, pero es un solo work unit: 2831 de esas líneas son el retiro de los HTML de
exploración (`designs/identity/index.html`, `design/users-detail/*`, `design/system.html`),
que no se puede partir sin dejar referencias colgadas entre commits — el índice, la
desviación de `docs/` y el retiro se sostienen entre sí. Cierre del slice: este commit es el
último del ticket; el siguiente paso es PR a `develop`.
