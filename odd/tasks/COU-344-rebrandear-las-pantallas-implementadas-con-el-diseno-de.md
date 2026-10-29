# COU-344 — Rebrandear las pantallas implementadas con el diseño de `design/app`

Ticket: [COU-344](https://linear.app/countergank/issue/COU-344/rebrandear-las-pantallas-implementadas-con-el-diseno-de) · Proyecto `ui-user` · Estimación 5 · Rama `feature/cou-344-rebrandear-las-pantallas-implementadas-con-el-diseno-de`

## Specs

**S1.** La paleta aplicada es la de `design/app/tokens-app.css`, sin colores fuera de tokens.

> "- [ ] `src/styles/tokens.css` refleja la paleta de `design/app/tokens-app.css` (27 tokens remapeados + 21 nuevos + avatares), sin colores hardcodeados fuera de tokens en las pantallas del inventario."

**S2.** Las tres familias se entregan localmente y los títulos usan `--font-display`.

> "- [ ] Las tres familias se cargan localmente (Inter, Space Grotesk, JetBrains Mono) y `--font-display` se usa en títulos; ninguna pantalla cae a `system-ui`."

**S3.** El selector de tema funciona y `.dark` queda remapeado a la paleta nueva.

> "- [ ] Selector de tema `system / light / dark` funcional y persistido, con el bloque `.dark` remapeado a la nueva paleta."

**S4.** Control de idioma presente en el shell.

> "- [ ] Botón de idioma presente en el shell; si sólo hay un locale activo, queda deshabilitado y documentado, a la espera de COU-277."

**S5.** Header público con `About` y `Sign in`; el login sigue redirigiendo al dashboard.

> "- [ ] Header público con `About` y `Sign in` en todas las rutas públicas; login redirige al dashboard como hoy."

**S6.** Las pantallas sin artboard no inventan patrones.

> "- [ ] Las tres pantallas sin artboard usan el shell y los tokens sin introducir patrones nuevos."

**S7.** Gate completo en verde, sin regresiones de axe.

> "- [ ] `npm run lint`, `npm run typecheck` y `npm run test` en verde, con la instrumentación de axe sin regresiones nuevas."

**S8.** Contrastes AA verificados, sobre todo texto sobre `--primary` y superficies inversas.

> "- [ ] Contrastes AA verificados en la nueva paleta, especialmente texto sobre `--primary` y sobre superficies inversas."

**S9.** Una sola fuente de verdad, sin contradicciones entre las tres piezas.

> "- [ ] Queda **una sola** fuente de verdad de la paleta, y `docs/design-system.md` y `design/system.md` no se contradicen entre sí ni con `tokens-app.css`."

**S10.** La landing canónica queda declarada por escrito.

> "- [ ] Está declarado por escrito cuál es la landing canónica."

**S11.** Alcance positivo y no-objetivos del ticket.

> "Aplicar el rebranding a **todas las pantallas ya implementadas**, con un solo criterio visual: tokens + fuentes + shell, y cada pantalla alineada a su artboard cuando existe."
> "* Implementar pantallas que existen sólo en el diseño: **inicio**, **roles y permisos** y **sistema** van en sus propios tickets."

## Copy de los artboards (extraído el 2026-10-29)

Texto visible real de los exports, extraído con shell. Es la fuente para alinear copy y bloques;
las cadenas van a los bundles de i18n (ADR-12: `en`, `es`, `pt` con paridad obligatoria).

**`02-login.html`** — split 620/820.

* Izquierda: `CG` `COUNTERGANK` · `Iniciá sesión` · `Accedé con tu cuenta de administrador.` ·
  `EMAIL` · `CONTRASEÑA` · `Recordarme` · `¿Olvidaste tu contraseña?` · `Sign in` ·
  `Crear una cuenta` · `Al continuar aceptás los` `términos` `y la` `política de privacidad` ·
  `© 2026 Countergank · Argentina` · `Volver al sitio`.
* Derecha (panel de marca): `CONSOLA DE ADMINISTRACIÓN` · `API · healthy` ·
  `Administrá usuarios sin perder el rastro de nada.` ·
  `Cada alta, cada permiso y cada sesión cerrada queda registrada con su correlationId.` ·
  bullets: `RBAC de 22 permisos con roles editables`, `Auditoría por request con correlationId`,
  `Revocación de sesiones por epoch`, `Plantillas de email y parámetros en caliente` ·
  pie: `MongoDB replica set · Redis · v1.1.0`.

**`01-landing.html`** — 1440×2119.

* Header: `COUNTERGANK` · `Producto` · `Capacidades` · `Seguridad` · `About` · `Sign in`.
* Hero: eyebrow `PLATAFORMA DE ADMINISTRACIÓN DE USUARIOS` ·
  título `Permisos reales, sesiones controladas, todo auditado.` ·
  lead `Un backend de gestión de usuarios con RBAC de 22 permisos, revocación de sesiones y
  auditoría por request. Esta aplicación es su consola de administración.` ·
  CTA `Ver capacidades` · chips `JWT + refresh`, `RBAC 22 permisos`, `Auditoría por request`.
* Mock del producto (prueba visual): sidebar `GESTIÓN` con `Usuarios`, `Roles y permisos`,
  `Auditoría`, `Parámetros`; buscador `Buscar usuario…`; acción `Nuevo usuario`;
  KPIs `TOTAL 1.248`, `ACTIVOS 1.187`, `BLOQUEADOS 12`; tabla con `Leandro Cepeda/admin/activo`,
  `Marta Gómez/user/activo`, `Julián Pérez/viewer/activo`, `Diego Sosa/bloqueado`.
* `CAPACIDADES` · `Lo que el backend ya resuelve` · `Nada de esto es una maqueta: son endpoints
  en producción`, con seis bloques: `RBAC granular`, `Auditoría trazable`, `Sesiones revocables`,
  `Email transaccional`, `i18n en caliente`, `Parámetros vivos` (cada uno con su descripción).
* `SEGURIDAD` · `El modelo de amenaza está en el diseño, no en el README.` · `Access corto,
  refresh con epoch verificable.` · `Lockout por intentos` · `lockedUntil por cuenta ante fuerza
  bruta.`

Diferencias medidas contra lo implementado: `Login` es una tarjeta centrada sin panel de marca ni
`Recordarme`/`Crear una cuenta`/legales; `Landing` tiene hero distinto, no tiene mock, sus cuatro
tarjetas genéricas no son las seis capacidades, no tiene sección de seguridad y sí tiene dos
secciones (`Quickstart`, `Stack`) que no existen en el artboard.

## Tasks

| ID | S# | Qué | Path | Commit |
|---|---|---|---|---|
| T0 | S1, S3 (insumo) | Paleta oscura verificada y modos en el `.fig`: 66 tokens, 25/25 AA, 1.265 propiedades atadas | `design/app/tokens-dark.css`, `design/app/palette-dark.html`, `design/app/design.json` | — (staged) |
| T1 | S1, S2, S3, S8 | Tokens nuevos, `.dark` remapeado, tres familias con `@font-face`, contraste AA | `src/styles/tokens.css`, `src/styles/index.css`, `tailwind.config.js`, `src/styles/tokens.test.ts` | — |
| T2 | S3, S4 | Verificar selector de tema e idioma contra la paleta nueva | `src/components/theme/`, `src/lib/i18n/` | — |
| T3 | S5 | Landing y login alineados a sus artboards | `src/features/landing/`, `src/features/auth/` | — |
| T4 | S1, S6 | Lista, detalle, alta, edición y 403 sobre tokens y shell | `src/features/users/`, `src/features/console/` | — |
| T5 | S9, S10 | Docs de diseño siguiendo la paleta aplicada | `design/system.md`, `docs/design-system.md` | — |
| T6 | S7 | Gate completo y axe sin regresiones | n/a | — |

## Log

**L1** — Pedido original (verbatim):

> "perfecto mergeado, vamos directamente al siguiente ticket, cual sigue?"

**L2** — Fuente de las specs: la descripción del ticket COU-344 en Linear, leída completa el
2026-10-28 (6.218 caracteres). Este documento la reconcilia; el texto íntegro vive en el
ticket, no acá.

**L3** — **Solapamiento con COU-345, ya resuelto.** La sección "Diseños que quedan históricos"
del ticket quedó obsoleta: `design/users-detail/` está retirado, `designs/identity/index.html`
retirado, `design/system.html` retirado, `docs/design-system.md` corregido y la landing
canónica declarada en `design/README.md` (todo en COU-345, commit `fbaed17`, merge `0547293`).
Queda vigente de esa sección sólo reescribir `design/system.md` con la paleta aplicada (T5).

**L4** — **Hallazgo: S3 y S4 ya están implementados.** El selector `system/light/dark` existe,
persiste en `countergank.ui.theme` y tiene bootstrap pre-paint en `index.html:13-33`, con
`src/lib/theme/theme.ts`, `theme-sync.ts` y `ThemeSwitcher`. El selector de idioma también
existe con **tres locales reales** (`en/es/pt`), así que la condición "si sólo hay un locale
activo" de S4 no aplica: el trabajo de T2 es verificar que sigan funcionando tras la paleta,
no construir los controles. El header público ya tiene `About` y `Sign in`.

**L5** — **AA calculado sobre la paleta propuesta** (no estimado), con la fórmula de
`src/styles/tokens.test.ts`: `--foreground`/`--background` 18.94, `--muted-foreground` sobre
`--background`/`--card`/`--muted` 7.21/7.21/6.49, `--primary-foreground`/`--primary` 7.78,
`--destructive-foreground`/`--destructive` 6.55, `--warning-foreground` en tinte 4.89,
`--danger-foreground` en tinte 5.20. **`--success-foreground` en tinte 14% da 4.33 y falla AA**:
se corrige con el ajuste mínimo de luminosidad y se registra como desviación, igual que el
precedente de `--muted-foreground` (45% en vez de 47%).

**L6** — **`--info` no existe en la propuesta** (`tokens-app.css` define 59 tokens y ninguno es
`--info`/`--info-foreground`), pero el repo lo tiene y `tokens.test.ts` exige el par completo.
Se conserva el tono actual y se documenta como no rediseñado.

**L7** — **Conteos reales ≠ los del ticket.** El ticket dice "27 tokens remapeados + 21 nuevos";
el archivo propone **26 remapeados** (6 de ellos sin cambio de valor) y **29 nuevos**.

**L8** — **Bloqueo abierto: la paleta oscura no está diseñada.** `tokens-app.css` lo dice
explícito: "Solo tema claro… el bloque `.dark` no se toca acá", y no hay artboards en oscuro.
S3 y el guard de paridad de `tokens.test.ts` (todo token de tono debe existir en `:root` y en
`.dark`) impiden aplicar los 29 tokens nuevos sin definir el oscuro. Decisión del humano: se
busca primero en el `.fig` si el tema oscuro ya existe; si no existe, se crea en la sesión.
El archivo está comprimido (3.344 strings, cero coincidencias de `landing`/`primary`), así que
la única vía es el MCP de OpenPencil, cuyo puente no conecta: el proceso `OpenPencil`
(PID 24800, Windows) no expone ningún socket y `openpencil-mcp` sólo reenvía stdio al servidor
que levanta la app.

**L9** — **Requisito de entorno descubierto (no es del repo).** OpenPencil 0.16.0 sacó el
servidor MCP del binario: vive en el paquete npm `@open-pencil/mcp`, y su versión debe
coincidir con la de la app. Windows no tenía Node, así que la app no podía lanzar
`openpencil-mcp-http`. Instalado con nvm-windows (nvm-windows, con su raiz en el perfil del usuario y el symlink de node) + `npm i -g @open-pencil/mcp@0.16.0`. Consecuencias para la
próxima sesión: (1) tras cada actualización mayor de la app hay que reinstalar el paquete con
la versión nueva; (2) con nvm-windows los globales viven dentro de cada versión de node, así
que cambiar de versión con `nvm use` borra el shim hasta reinstalarlo; (3) una app lanzada
desde un `explorer.exe` anterior a la instalación hereda un PATH viejo y no encuentra el
comando, aunque el archivo exista.

**L10** — **Tema oscuro: derivado, no diseñado.** La app nunca completó su handshake con el
servidor MCP (ver L9 y el bloqueo registrado), así que el `.fig` no se pudo inspeccionar y no
sabemos si contiene un modo oscuro. Decisión del humano: crearlo en esta sesión. Se derivó el
bloque `.dark` desde la paleta clara con reglas explícitas — se conserva el hue, la luminosidad
se invierte hacia superficies oscuras, los `-foreground` se aclaran hasta pasar AA y los
`--inverse-*` se invierten a superficies claras. Verificación con la misma fórmula de
`src/styles/tokens.test.ts`: **14 pares exigidos, todos ≥ 4.5**, el más bajo
`destructive-foreground`/`destructive` en 5.39. Queda marcado como derivado: si el `.fig`
aparece con un oscuro diseñado, éste se reemplaza.

Bloque derivado (59 tokens):

```css
.dark {
  --background: 240 10% 6%;
  --foreground: 240 8% 96%;
  --card: 240 10% 9%;
  --card-foreground: 240 8% 96%;
  --popover: 240 10% 9%;
  --popover-foreground: 240 8% 96%;
  --muted: 240 10% 14%;
  --muted-foreground: 240 6% 64%;
  --muted-strong: 240 6% 78%;
  --secondary: 240 10% 14%;
  --secondary-foreground: 240 8% 96%;
  --border: 240 10% 20%;
  --border-subtle: 240 10% 15%;
  --border-strong: 240 10% 28%;
  --input: 240 10% 20%;
  --seg-thumb: 240 10% 24%;
  --track: 240 10% 20%;
  --surface-raised: 240 10% 11%;
  --surface-row-alt: 240 10% 8%;
  --text-subtle: 240 6% 72%;
  --text-faint: 240 5% 62%;
  --text-placeholder: 240 5% 52%;
  --text-divider: 240 10% 30%;
  --primary: 306 54% 62%;
  --primary-foreground: 240 8% 8%;
  --primary-hover: 306 54% 68%;
  --primary-soft: 306 54% 22%;
  --ring: 306 54% 62%;
  --accent: 276 42% 20%;
  --accent-foreground: 276 42% 88%;
  --destructive: 3 71% 62%;
  --destructive-foreground: 240 8% 8%;
  --success: 151 55% 55%;
  --success-foreground: 151 55% 78%;
  --success-soft: 151 40% 18%;
  --warning: 39 90% 58%;
  --warning-foreground: 39 90% 82%;
  --danger: 3 70% 60%;
  --danger-foreground: 3 70% 82%;
  --danger-soft: 3 45% 20%;
  --info: 199 85% 62%;
  --info-foreground: 199 85% 82%;
  --inverse-card: 240 8% 96%;
  --inverse-card-border: 240 8% 96%;
  --inverse-raised: 240 8% 96%;
  --inverse-border: 240 8% 96%;
  --inverse-avatar: 240 8% 96%;
  --inverse-accent-soft: 240 8% 96%;
  --inverse-text: 240 8% 96%;
  --inverse-text-subtle: 240 8% 96%;
  --avatar-1-bg: 145 40% 24%;
  --avatar-2-bg: 215 68% 24%;
  --avatar-3-bg: 189 47% 24%;
  --avatar-4-bg: 340 36% 24%;
  --avatar-5-bg: 36 31% 24%;
  --avatar-6-bg: 258 68% 24%;
  --avatar-2-fg: 214 57% 92%;
  --avatar-3-fg: 187 59% 92%;
  --avatar-4-fg: 336 47% 92%;
}
```

**L11** — **El `.fig` se leyó por fin, y confirma que no hay tema oscuro.** La cadena quedó
como corresponde: `openpencil-mcp-http` corre en WSL bajo systemd (`--user`, con `linger`),
escribe su discovery en `$XDG_RUNTIME_DIR/openpencil/mcp.json`, y la app de Windows se conecta
como cliente a `127.0.0.1:7600` al arrancar. Lo que rompía el enganche era el discovery del lado
Windows apuntando a un server muerto; con el discovery vivo (`authRequired: true`, token de 32
caracteres) la app engancha y `/health` responde `ok`. Evidencia del documento
`Dashboard User UI.fig`: **1 página, 7 frames** (Login, Inicio, Resumen, Detalle de usuario,
Roles y permisos, Sistema, Landing), **0 colecciones de variables y 0 variables**, y los cuatro
frames `ThemeDark` son el botón de luna del `ThemeSwitch` dentro de `TopbarRight`, no artboards
oscuros. Conclusión: el diseño **no define** paleta oscura; la derivada de L10 es la única
opción y no contradice ningún arte. Si más adelante se diseñan artboards oscuros, esos valores
reemplazan a los derivados.

**L12** — **Paleta oscura armónica (v2), reemplaza a la mecánica de L10.** Pasada de diseño, no
sólo de aritmética. Seis decisiones, cada una con su motivo:

1. **Neutros teñidos a 250**, no 240 puros: 240 es el neutro frío del tema claro y 306 el de la
   marca; 250 queda entre ambos, así el oscuro se lee de la misma familia sin verse coloreado.
2. **Escalera de elevación invertida.** En claro el orden es `background 100% → raised 98%`; en
   oscuro cada paso aclara: `background 7% → card 10% → popover 12% → surface-raised 14%`. Es la
   convención de Material y la única forma de que una tarjeta "flote" sobre un fondo oscuro.
3. **Escalera de texto de cinco pasos**: `96 → 80 → 74 → 66 → 58 → 50`. El tema claro sólo tiene
   dos (7 y 36) y por eso pierde jerarquía en pantallas densas.
4. **Marca desaturada y aclarada**: `306 54% 35%` pasa a `306 46% 66%`. Bajar saturación evita el
   efecto neón del magenta puro sobre negro; el texto encima es casi negro (`250 14% 8%`).
5. **Tonos calmados**: además de aclarar, se desaturan (success 61→46, danger 71→62, warning
   100→80). Un verde saturado al 58% sobre `250 10% 7%` brilla como un LED.
6. **`--inverse-*` invertidos**: en claro eran superficies oscuras dentro del claro; en oscuro
   son superficies claras (`inverse-card 95%`) con texto oscuro (`inverse-text 12%`).

AA verificado con la fórmula de `tokens.test.ts`: **25/25 pares en verde**. El más ajustado es
`text-placeholder / background` en **4.56**; `primary-foreground / primary` 6.80, tonos sobre
tinte 12.68-15.78, `muted-foreground` sobre `muted` 6.09. Bordes medidos contra el modelo claro
en vez de exigirles un 3:1 que el claro nunca cumplió: `border/background` 1.19 → 1.54,
`border-strong/background` 1.17 → 2.15, `ring/background` 7.78 → 6.89.

```css
.dark {
  --background: 250 10% 7%;
  --surface-row-alt: 250 10% 9%;
  --card: 250 10% 10%;
  --popover: 250 10% 12%;
  --surface-raised: 250 10% 14%;
  --muted: 250 9% 16%;
  --secondary: 250 9% 16%;
  --border-subtle: 250 9% 17%;
  --border: 250 8% 22%;
  --input: 250 8% 22%;
  --border-strong: 250 8% 31%;
  --track: 250 8% 24%;
  --seg-thumb: 250 8% 29%;
  --text-divider: 250 8% 31%;
  --foreground: 250 9% 96%;
  --card-foreground: 250 9% 96%;
  --popover-foreground: 250 9% 96%;
  --secondary-foreground: 250 9% 96%;
  --muted-strong: 250 7% 80%;
  --text-subtle: 250 7% 74%;
  --muted-foreground: 250 6% 66%;
  --text-faint: 250 6% 58%;
  --text-placeholder: 250 6% 51%;
  --primary: 306 46% 66%;
  --primary-hover: 306 46% 72%;
  --primary-foreground: 250 14% 8%;
  --primary-soft: 306 34% 20%;
  --ring: 306 46% 66%;
  --accent: 276 38% 24%;
  --accent-foreground: 276 42% 88%;
  --destructive: 3 64% 64%;
  --destructive-foreground: 250 14% 9%;
  --success: 151 46% 58%;
  --success-foreground: 151 40% 84%;
  --success-soft: 151 30% 16%;
  --warning: 39 80% 62%;
  --warning-foreground: 39 70% 88%;
  --danger: 3 62% 64%;
  --danger-foreground: 3 60% 86%;
  --danger-soft: 3 32% 18%;
  --info: 199 62% 64%;
  --info-foreground: 199 52% 86%;
  --inverse-card: 250 9% 95%;
  --inverse-card-border: 250 9% 95%;
  --inverse-raised: 250 9% 95%;
  --inverse-border: 250 9% 95%;
  --inverse-avatar: 250 9% 95%;
  --inverse-accent-soft: 250 9% 95%;
  --inverse-text: 250 9% 12%;
  --inverse-text-subtle: 250 9% 12%;
  --avatar-1-bg: 145 40% 26%;
  --avatar-2-bg: 215 68% 26%;
  --avatar-3-bg: 189 47% 26%;
  --avatar-4-bg: 340 36% 26%;
  --avatar-5-bg: 36 31% 26%;
  --avatar-6-bg: 258 68% 26%;
  --avatar-2-fg: 214 57% 92%;
  --avatar-3-fg: 187 59% 92%;
  --avatar-4-fg: 336 47% 92%;
}
```

**L13** — **Modo oscuro dentro del `.fig`: pipeline probado, paleta a revisar.** Se construyó
el sistema de tokens en el documento: colección `Tokens` con **56 variables de color** y dos
modos, `Light` (`1257021454:8`, predeterminado) y `Dark` (`1257021454:9`), importados como DTCG
(`import_design_tokens`, un archivo por modo). Se ataron **1.093 rellenos** con
`bind_variable` campo `fills/0/color`: Login 43, Inicio 140, Resumen 210, Detalle 196, Roles
223, Sistema 158, Landing 123. Quedan literales sólo tres colores decorativos del mock del
hero (`#C9A0DC`, `#6E4FA3`, `#3FBF7F`), que no tienen token por diseño.

Verificaciones hechas:
* El render claro por variables es **byte-idéntico** al anterior (90.272 bytes), así que el atado
  no rompió nada.
* El lienzo resuelve el modo **predeterminado de la colección** (`Light`); el `Siempre activo
  :root → Dark` del panel de Variables es mapeo **para exportar código**, y el MCP no expone
  ningún comando para cambiar el modo activo. Para ver el oscuro se hizo un **preview
  reversible**: copiar los 56 valores `Dark` sobre `Light`, exportar PNG y restaurar (56/56
  restaurados).
* **Corrección de un diagnóstico previo:** los nodos `TEXT` **sí están atados**; guardan la
  variable en `boundVariables["fills/0/color"]` a nivel de nodo, no en `fills[0]`. Verificado en
  `LoginBrandMarkText` (`0:8`) → `color/background`, `resolvedValue` blanco. La lectura inicial
  de "SIN ATAR" fue un error del script de inspección, no del documento.

**Problema abierto y decisión del humano (2026-10-28):** el preview oscuro muestra que la
paleta derivada **no alcanza**: varios componentes pierden legibilidad y el resultado no se
siente como un dark mode cuidado. Decisión: **rehacer la paleta oscura** con una referencia
externa (paletas de dark mode de productos comparables) antes de aplicarla a `src/`, y recién
entonces repetir el preview. Riesgo asociado ya identificado: el atado por color más cercano no
conoce el **rol** —`#FFFFFF` es a la vez fondo de página y texto sobre `--primary`—, así que la
próxima pasada necesita reglas por rol (texto sobre superficies inversas → `inverse-text*`,
texto sobre relleno sólido → `*-foreground`) o tokens distintos para cada uso.

Estado de cierre: rama `feature/cou-344-rebrandear-las-pantallas-implementadas-con-el-diseno-de`
desde `0547293`, **sin commits**; en el árbol sólo los dos archivos nuevos del ODD
(`odd/tasks/COU-344-…md` y su mirror). `src/` intacto.

**L14** — **Paleta oscura redefinida sobre Radix Colors (reemplaza la derivada de L12).** La v2
derivada no alcanzaba: varios componentes perdían legibilidad. Nueva base documentada: escalas
**dark de Radix Colors** (12 pasos por familia), `mauve` para neutros, `plum` para la marca,
`grass`/`amber`/`red`/`blue` para estados. Mapeo por rol: `mauve1` fondo, `mauve2` tarjeta,
`mauve3` popover/muted, `mauve4` elevada, `mauve5-7` bordes, `mauve11` texto de apoyo,
`mauve12` texto principal.

Cuatro fallos AA del primer intento y su corrección:
* `text-faint` y `text-placeholder` en 4.46 → se interpola entre `mauve9` y `mauve10` hasta
  pasar: `#82808b`.
* Blanco sobre `primary` (`plum9 #ab4aba`) en 3.91 → el primario sube a `plum9 #b658c4` con
  etiqueta casi negra (`#150a17`), que es la inversión correcta del claro (allí era violeta
  oscuro con texto blanco).
* Blanco sobre `destructive` en 3.91 → el rojo baja a `red7 #b54548`, que sí sostiene el blanco.
* Hover: `plum10` era un paso de texto (demasiado claro) → se reemplazó por un aclarado del 16%
  del propio primario (`#c273cd`).

Resultado: **59 tokens, 23/23 pares AA en verde**. Se versionan dos archivos nuevos:
`design/app/tokens-dark.css` (bloque `.dark` con hex en comentarios, formato listo para
`src/styles/tokens.css`) y `design/app/palette-dark.html` (tablero autocontenido: 59 muestras
con token, hex y HSL, más la tabla de contraste).

Plan acordado con el humano para el resto: verificar la paleta en el tablero → dejar **una sola
pantalla** switcheable (`Inicio` o `Landing`) para comparar → recién entonces replicar al resto.

**L15** — **Modo oscuro cerrado en el `.fig`.** Estado final del archivo de diseño:

* **Paleta**: 66 tokens de color, base Radix (`mauve`, `plum`, `grass`, `amber`, `red`, `blue`) más
  cuatro de chrome (`sidebar`, `sidebar-foreground`, `sidebar-border`, `sidebar-accent`).
  **25/25 pares AA** en la paleta; `tokens-app.css` y `tokens-dark.css` tienen exactamente los
  mismos 66 nombres (`diff` vacío).
* **Variables**: colección `Tokens` con 66 variables y dos modos, `Light` (predeterminado) y
  `Dark`, con los valores de ambos archivos.
* **Atado**: ~1.265 propiedades — 1.093 rellenos (`fills/0/color`) y **172 trazos**
  (`strokes/0/color`). Los trazos estaban sin atar y eran la causa de que los bordes del preview
  se vieran blancos en oscuro.
* **Modo del lienzo**: se aplica **por capa o por página** con el control *Apply variable mode*
  (`setVariableMode(editor, nodes, collectionId, modeId)` en el SDK). La colección por sí sola
  **no** repinta el lienzo; el panel de Variables es el generador de CSS condicional
  (`:root` + `@media (prefers-color-scheme: dark)`), verificado con `design_to_tokens`.
* **Contraste en contexto**: 710 textos medidos en oscuro contra su superficie real, **0 fallas**.
  Dos reglas aprendidas, ambas por haberlas violado primero: (1) optimizar sólo el contraste
  oscuro rompe la fidelidad del claro — la etiqueta blanca del nav se volvió gris y los
  "completado" verdes también; la regla correcta es *entre los candidatos que pasan en oscuro,
  elegir el que más se parezca al color original*; (2) cuando un token falla por poco, se sube
  **el valor** (`text-faint` y `text-placeholder` a `#8A8893`, 4.54 sobre el sidebar), no se
  rebindea el texto.
* **Layout**: 16 filas horizontales de `Inicio` y `Sistema` desbordaban su contenedor (`StepRow`
  758 en 730; `ServiceRow` 311 en 304; `Tab-Auditoría` +26). El bloque de texto flexible absorbió
  el excedente. El caso de `Detalle` con +1001px era un falso positivo: esos chips envuelven en
  varias líneas.
* **Bordes**: el experimento de afinado (bordes más suaves, tarjeta elevada, borde igual a la
  tarjeta) se revirtió a pedido; queda el mapeo Radix original. El color definitivo se decide
  cuando se implemente.
* **Registro visual**: los artboards HTML versionados son del tema claro. No se exportan PNG de
  ambos modos: la convención del proyecto son los HTML, y el oscuro se genera como CSS desde el
  propio archivo (`design/app/tokens-dark.css`, `design/app/palette-dark.html`).

Pendiente único del lado del diseño: **guardar el documento desde la app** para que todo quede en
MEGA.

**L16** — **T1 aplicado a `src/` y dos valores del diseño corregidos.** El worker escribió
`src/styles/tokens.css` con los 66 tokens en ambos bloques (tomados de `tokens-app.css` y
`tokens-dark.css`), agregó las tres familias con `@font-face` desde `public/fonts/`, `--font-display`
con su utilidad en Tailwind y extendió `src/styles/tokens.test.ts` a 21 casos de contraste más
paridad. `npx vitest run src/styles`: **23/23**, `npm run typecheck` limpio, `npm run lint` limpio.

Dos valores del diseño **no pasaban AA** y el worker los bajó al mínimo que sí pasa:

| Token (claro) | Diseño | Aplicado | Medición |
|---|---|---|---|
| `--success-foreground` | `151 61% 30%` | `151 61% 29%` (`#1D774B`) | 4.33 → **4.57** sobre tinte 14% |
| `--info-foreground` | `208 88% 43%` | `208 88% 40%` (`#0C6CC0`) | 4.00 → **4.51** sobre tinte 14% |

El de success ya estaba registrado como riesgo en L5; el de info es un hallazgo nuevo de haber
agregado el token después (ver L6). Para no reabrir la contradicción que cerró COU-345, se
corrigieron **los archivos de diseño**, no sólo el código: `design/app/tokens-app.css` ahora dice
29% y 40% con su hex. El diseño y el código vuelven a coincidir.

Detalle menor: `@font-face` de Space Grotesk quedó con `font-weight: 300 700`, que es el eje real
de la fuente, en lugar de `100 900`.

**L17** — **Los cinco hallazgos advisories del review, resueltos.** El review aprobado dejó
cinco observaciones no bloqueantes; el humano pidió corregirlas todas antes de seguir con T3.

* `R1-local-env-details-in-committed-log` — **corregido**. El Log y `design/README.md` ya no
  contienen rutas del perfil del usuario ni de MEGA: el paso de re-export nombra la carpeta MEGA
  del proyecto de forma genérica. Ojo: los commits `3690ae2` y `c02b1b3` todavía llevan la ruta
  dentro de su contenido; la rama nunca se publicó, así que reescribir la historia local está
  sobre la mesa y pendiente de decisión.
* `R3-readme-token-count` — **corregido**: el índice decía 63 tokens y 63 muestras; la paleta
  tiene 66. Ahora dice 66 en ambas líneas.
* `R3-dark-placeholder-contrast` — **corregido**. `text-faint` y `text-placeholder` oscuros
  estaban en `251 5% 55%`: 4.30 sobre `--surface-raised`, por debajo de AA. Subieron a
  `251 5% 58%` (`#918F99`): **4.52 sobre la superficie elevada** y 5.91 sobre el fondo. Aplicado
  en `design/app/tokens-dark.css`, en el bloque `.dark` de `src/styles/tokens.css` y en el modo
  `Dark` de la colección del `.fig`, para que los tres lados sigan coincidiendo.
* `R3-tint-surface-coverage` — **corregido**. El test sólo componía los tintes sobre
  `--background`; se agregaron **8 aserciones** (4 tonos × 2 modos) que los componen sobre
  `--card`. `tokens.test.ts` pasó de 21 a **29 casos**, y los 31 del directorio pasan.
* `R3-light-hover-collapsed` — **aceptado, sin cambio**. El diseño de OpenPencil define
  `--primary` y `--primary-hover` con el mismo valor (`306 54% 35%`), así que el hover no se
  distingue en claro. El humano eligió dejarlo tal cual está en el diseño y revisarlo más
  adelante; queda documentado como decisión, no como defecto.

Verificación: `npx vitest run src/styles` 31/31, `npm run typecheck` limpio, `npm run lint`
limpio (238 archivos).

**L18** — **Landing contra la captura del diseño.** El humano pasó `Landing@1x.png`, el render del
artboard, y se midieron los fondos al píxel: header/hero/CTA/footer `#121113`, banda de
capacidades `#2B292D`, cards de seguridad y banda del CTA `#232225`. **No hace falta una escala
nueva de tokens**: son los tokens oscuros que ya existen, mal mapeados.

Mapeo confirmado por el humano (en los dos temas, porque los tokens se adaptan):

| Sección | Fondo |
|---|---|
| Hero | `background` |
| Capacidades | **`surface-raised`** (`#2B292D` en oscuro) |
| Seguridad | **`surface-row-alt`** (`#1A191B` en oscuro) |
| CTA final | `muted` |

Regla de trabajo acordada: antes de tocar código, repetir el pedido en una línea y mostrar el
cambio exacto.

Pendiente del landing, medido contra la captura:

1. Grilla **3×2** en capacidades (hoy 2 columnas), con el subtítulo a la derecha del título.
2. `Ver capacidades` como **link de texto**, no botón con borde.
3. **Tildes verdes** en los chips del hero.
4. **CTA final centrado**: `Sign in` magenta + `About` como texto.
5. **Header**: nav `Producto · Capacidades · Seguridad` a la izquierda, `Sign in` como botón claro.
6. **Footer**: `About · Capacidades · Sign in · GitHub`.

**L19** — **Review nativa del bloque de landing, abierta.** Candidato staged de 18 archivos
(1.065 líneas): las cuatro secciones del landing, el shell público, los tres locales y `About`.

- Lineage: **`review-5947c96183121bf6`** · target `sha256:3ff0ae0a…` · tier **high**.
- El tier salió high por una señal del clasificador sobre `src/features/landing/components/security.tsx`:
  el clasificador lo marcó como *hot path* por el **nombre del archivo**, no por su contenido
  (son tres cards estáticas con un `Lock` y un `Mail`). No hay superficie de seguridad ahí.
- Lentes: `readability` y `reliability`.
- Estado: `collect` con dos slots pendientes — `reviewer-readability` (order 0) y
  `reviewer-reliability` (order 1). Cada uno requiere primero el forecast y después el
  acknowledgement con el mismo binding exacto.

Para retomar: `gentle_review` con `{"operation":"status","lineageId":"review-5947c96183121bf6"}`
y seguir los `collectBindings` que devuelve.

## Handoff para retomar

**Rama**: `feature/cou-344-rebrandear-las-pantallas-implementadas-con-el-diseno-de` · 8 commits
sobre `origin/develop` · último `854a10e` · árbol limpio.

**Hecho**: T0 (paleta y modos en el `.fig`), T1 (tokens y fuentes), T2 (selectores verificados),
T3 (login `d581ec5` + landing `854a10e`).

**Pendiente, con lo que falta en cada uno:**

* **T4 — pantallas de consola (S1, S6).** `src/features/users/` y `src/features/console/`.
  Pantallas: lista (`04-resumen`), detalle (`05-detalle-usuario`), alta, edición y 403.
  **Primer paso obligatorio**: extraer el copy de `design/app/04-*.html` y `05-*.html` con shell,
  igual que se hizo para landing y login (son archivos de una línea; usar
  `replace(/<[^>]+>/g,"\n")` y quedarse con las líneas únicas). Sin eso no hay con qué alinear.
  Alta, edición y 403 no tienen artboard: se resuelven con el shell y los tokens (S6).
* **T5 — docs (S9, S10).** Reescribir `design/system.md` y `docs/design-system.md` con la paleta
  aplicada (hoy describen la violeta anterior) y dejar una sola fuente de verdad.
* **T6 — gate (S7).** `npm run lint`, `npm run typecheck`, `npm run test` y axe sin regresiones.

**Abierto fuera del ticket:**

* Review del landing: `review-5947c96183121bf6` quedó sin reviewers ejecutados y su candidato ya
  cambió con `854a10e`; hay que **abrir una nueva** sobre el rango `ae3c91b..854a10e`.
* Flake `ReferenceError: window is not defined` en un test de entorno node: tumba el CI de
  cualquier PR de forma intermitente. Merece ticket propio.
* PR #40 (redacción de rutas) está verde y espera el merge del humano.
