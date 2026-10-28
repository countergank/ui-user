# COU-342 — Rebrandear la interfaz con el diseño integral del dashboard

Ticket: [COU-342](https://linear.app/countergank/issue/COU-342/rebrandear-la-interfaz-con-el-diseno-integral-del-dashboard) · Proyecto `ui-user` · Estimación 5 · Rama `feature/cou-342-rebrandear-la-interfaz-con-el-diseno-integral-del-dashboard`

## Specs

**S1.** El diseño cubre el dashboard completo y todas las capacidades reales de `api-user`.

> "lo que necesito ahora, es que usemos el mcp pero esta vez para crear un dashboard para un sistema de administracion de usuarios, la idea es que cuente con todas las caracteristicas que hoy ofrece api-user de countergank ~/countergank/api-user/"

**S2.** Se suma una landing de inicio del sistema, más selector de idioma y selector de tema system/light/dark como botones de ícono.

> "ok lo que estaria faltando en este dashboard es una landing de inicio para el proyecto este en particular, tambien falta boton de cambio de idioma, de seleccion de Tema nicht light y system (icon buttons)"

**S3.** Se suma una pantalla inicial pública con información del proyecto, header con About y Sign in, y una pantalla de login que redirige al dashboard.

> "Lo que estaria faltando por ultimo, es como pantalla inicial de la aplicacion una landing con informacion acerca del proyecto, y en el header botones de about y de sign in, tambien la pantalla de inicio de sesion que recieen ahi redireccionaria al dashboard"

**S4.** La landing pública lleva el logo real de Countergank, como la otra landing del día.

> "lo que note que esta faltando en la landing es el logo de countergank, como lo tiene la otra Landing que creamos en el otro archivo de diseño de hoy"

**S5.** Los recursos de diseño deben quedar versionados en el repo y ser legibles por otra sesión, en sólo lectura.

> "lo que necesito saber es si para poder implementar todo esto tal como esta, y que una de las sesiones de pi que esta realizando la implementacion pueda acceder a los recursos de diseño solo de lectura, deberia guardarlo directamente en el directorio del repositorio y en que formato deberia hacerlo."

**S6.** El repositorio destino es `ui-user` y el alta de archivos pasa por la skill `kickoff`.

> "Primero revisemos donde entraria todo, el repositorio del proyecto es ~/countergank/ui-user/, pero si queremos meter archivos y demas necesitamos usar la skill kickoff que tiene el repo actualmente"

**S7.** Es un rebranding: la aplicación se adapta al diseño, no al revés.

> "En realidad el proyecto se va a tener que adaptar al diseño, esto seria un rebranding de la aplicacion actual"

**S8.** El `.fig` editable queda fuera del repositorio, en el directorio MEGA que ya se usa; lo versionado es lo legible.

> "entonces dejo el .fig en el directorio actual de mega y el resto lo dejaremos como lo sugeriste"

## Tasks

| ID | S# | Qué | Path | Commit |
|---|---|---|---|---|
| T1 | S1-S3 | Exportar los 7 artboards a HTML autocontenido | `design/app/01…07-*.html` | — |
| T2 | S8 | Publicar el `.fig` editable fuera del repo (MEGA, con backup) | `MEGA/…/designs/Dashboard User UI.fig` | n/a |
| T3 | S1-S5 | Documentar artboards y tradeoffs | `design/app/design.json` | — |
| T4 | S7 | Proponer el mapeo de tokens en triples HSL (62 tokens: 27 remapeados, 21 nuevos, avatares y familias) | `design/app/tokens-app.css` | — |
| T6 | S7 | Inventariar los 46 colores usados por los artboards, cada uno con su token | `design/app/palette.json` | — |
| T7 | S7 | Empaquetar las tres familias como woff2 variables + licencias OFL | `design/app/fonts/`, `design/app/fonts.css` | — |
| T5 | S6 | Registro ODD del ticket | `odd/tasks/COU-342-diseno-dashboard.md` | — |

Pendiente en tickets por pantalla: implementar componentes, aplicar `tokens-app.css` sobre `src/styles/tokens.css` y actualizar `design/system.md`, que hoy documenta la paleta anterior.

## Log

**L1** — Pedido original (verbatim):

> "Me ayudas con todo esto? Armemos una serie de pasos para ir completando uno a uno. Primero revisemos donde entraria todo, el repositorio del proyecto es ~/countergank/ui-user/, pero si queremos meter archivos y demas necesitamos usar la skill kickoff que tiene el repo actualmente"

**L2** — Corrección de alcance: no es alinear el diseño al design system existente, es rebranding. La paleta del logo (`#8B2A82`) se mantiene y el design system se actualiza después.

**L3** — Decisión de formato: `.fig` fuera del repo (MEGA); se versionan HTML + `design.json` + `tokens-app.css`, siguiendo el esquema de `design/users-detail/`.

**L4** — Nombre de carpeta: `design/app/` (genérico, coherente con el router privado `/app/...`), en lugar de un slug por pantalla.

**L5** — Verificación de `.fig`: los 7 artboards exportan alto exacto salvo Landing, que desbordaba 79px; se corrigió el marco a 2120 y se re-exportó.

**L6** — Hallazgo del entorno: `save_file` del MCP escribe con semántica Windows (`D:\home\…`), porque el server corre en WSL y la app en Windows. El `.fig` se publicó copiándolo desde ahí a MEGA, con backup del anterior.

**L7** — La paleta semántica no alcanzaba: los artboards usan 46 colores y sólo 13 caían en tokens existentes del repo. Se inventariaron todos (21 nuevos + rampa de avatares + 3 decorativos del mock del hero) en `palette.json`, generado desde los HTML para que no pueda divergir.

**L8** — Riesgo de fidelidad tipográfica. En el `.fig` sólo Inter está disponible; JetBrains Mono (221 nodos) y Space Grotesk (36) se dibujan con **sustitutos**. El HTML declaraba los nombres sin `@font-face`, y el repo no entrega ninguna fuente. Se empaquetaron las tres familias como variables woff2 (subset latin, SIL OFL) con `@font-face` local, y se declaran `--font-display`/`--font-sans`/`--font-mono`. Consecuencia a tener presente: las alturas validadas se midieron con métricas sustituidas, así que con las fuentes reales algún título puede reflowar.
