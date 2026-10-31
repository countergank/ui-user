# Design system — ui-user

Sincronizado el 2026-10-31 desde las fuentes del proyecto. Cada token nombra su origen. No hay
valores inventados: si algo no aparece acá, no es un token del proyecto.

## Estado

Este documento describe la paleta **aplicada por COU-344**: la de `src/styles/tokens.css`,
tomada de `design/app/tokens-app.css` (claro) y `design/app/tokens-dark.css` (oscuro, base
Radix Colors: `mauve` para neutros, `plum` para la marca, `grass`/`amber`/`red`/`blue` para
estados). El violeta `262 83% 58%` del design system anterior ya no existe en el código.

Índice completo de la carpeta: `design/README.md`. La landing canónica es la implementada
(`src/features/landing/`), alineada al artboard `01-landing.html`.

## Sources

| Path | Qué aporta |
|---|---|
| `src/styles/tokens.css` | Colores (light y `.dark`), radios, sombras, las tres familias tipográficas |
| `tailwind.config.js` | Mapa token → utilidad Tailwind (`hsl(var(--x))`), escala de radios y sombras |
| `design/app/tokens-app.css` / `tokens-dark.css` | Origen de la paleta aplicada; `design/` es inventario, nunca fuente |

## Color

Todos los valores son triples HSL consumidos como `hsl(var(--token))`. Claro y oscuro en la
misma tabla; cada token existe en `:root` y en `.dark`.

### Base

| Token | Claro | Oscuro | Uso |
|---|---|---|---|
| `--background` / `--foreground` | `0 0% 100%` / `240 8% 7%` | `270 6% 7%` / `240 6% 94%` | Fondo y texto principal |
| `--card` / `--card-foreground` | `0 0% 100%` / `240 8% 7%` | `270 4% 10%` / `240 6% 94%` | Tarjetas genéricas |
| `--popover` / `--popover-foreground` | `0 0% 100%` / `240 8% 7%` | `260 4% 14%` / `240 6% 94%` | Popovers || `--muted` / `--muted-foreground` | `240 22% 96%` / `240 6% 36%` | `260 4% 14%` / `258 7% 72%` | Fondos secundarios y texto de apoyo |
| `--secondary` / `--secondary-foreground` | `240 22% 96%` / `240 8% 7%` | `260 4% 14%` / `240 6% 94%` | Badges neutros, botones secundarios |
| `--border` / `--input` | `240 14% 93%` / `240 13% 88%` | `270 5% 24%` / `270 5% 24%` | Bordes y contornos de campos |
| `--destructive` / `--destructive-foreground` | `3 71% 41%` / `0 0% 100%` | `358 45% 49%` / `0 0% 100%` | Acción destructiva |

### Marca

| Token | Claro | Oscuro |
|---|---|---|
| `--primary` / `--primary-foreground` | `306 54% 35%` (`#892980`) / `0 0% 100%` | `292 48% 56%` / `291 39% 6%` |
| `--primary-hover` | `306 54% 35%` (igual al primario: decisión del diseño, el hover no se distingue en claro) | `293 47% 63%` |
| `--primary-soft` / `--accent` | `276 42% 95%` | `297 42% 20%` |
| `--accent-foreground` | `306 54% 35%` | `292 79% 77%` |
| `--ring` | `306 54% 35%` | `292 30% 47%` |
| `--accent-violet` / `--accent-plum` | `281 46% 75%` / `262 35% 47%` | `296 34% 28%` / `294 31% 36%` |

### Estados

| Token | Claro | Oscuro |
|---|---|---|
| `--success` / `--success-foreground` | `151 61% 30%` / `151 61% 29%` | `151 55% 42%` / `151 65% 54%` |
| `--warning` / `--warning-foreground` | `39 100% 27%` / `39 100% 27%` | `39 100% 57%` / `46 100% 54%` |
| `--danger` / `--danger-foreground` | `3 71% 41%` / `3 71% 41%` | `358 45% 49%` / `2 100% 79%` |
| `--info` / `--info-foreground` | `209 100% 50%` / `208 88% 40%` | `206 100% 50%` / `210 100% 72%` |
| `--success-soft` / `--danger-soft` | `141 41% 93%` / `3 69% 95%` | `152 41% 13%` / `350 53% 15%` |

El tono desnudo va en puntos, bordes e íconos; el `-foreground` es el color de texto seguro
sobre tinte. Pares verificados en `src/styles/tokens.test.ts`.

### Superficies de consola

| Token | Claro | Oscuro | Uso |
|---|---|---|---|
| `--canvas` | `240 20% 98%` (`#F9F9FB`) | `270 4.7% 16.9%` (`#2B292D`) | Fondo de pantalla, detrás de todo panel |
| `--panel` | `0 0% 100%` (`#FFFFFF`) | `240 8.1% 7.3%` (`#111114`) | Tarjeta de la consola: detalle de usuario, KPIs del listado, tabla, laterales |
| `--panel-foreground` / `--panel-muted` / `--panel-subtle` / `--panel-faint` | `240 8% 7%` / `240 5% 45%` / `240 6% 36%` / `240 5% 57%` | `240 6% 94%` / `240 12% 85%` / `240 7% 68%` / `240 5% 57%` | Jerarquía de texto sobre panel |
| `--panel-accent` / `--panel-border` | `306 54% 35%` / `240 14% 93%` | `281 46% 75%` / `270 5% 24%` | Acento y borde del panel |
| `--avatar` / `--avatar-ring` | `276 42% 95%` (`#F3EDF8`) / `306 54% 35%` (`#892980`) | `297 42% 20%` (`#461E48`) / `291.7 48.2% 56.1%` (`#B659C5`) | Botón de usuario del topbar |
| `--avatar-1-bg`…`--avatar-6-bg` + `--avatar-2-fg`…`--avatar-4-fg` | seis fondos y tres textos, por tema | | Iniciales de avatar en toda la app |
| `--surface-raised` / `--surface-row-alt` | `240 25% 98%` / `240 20% 99%` | `270 5% 17%` / `270 4% 10%` | Superficie elevada y fila alterna; con clave Tailwind propia |
| `--sidebar` familia (`sidebar`, `sidebar-foreground`, `sidebar-border`, `sidebar-accent`, más `sidebar-highlight/muted/subtle/faint`) | `240 8% 7%` / `240 6% 94%` / `270 5% 17%` / `270 17% 14%` | `260 4% 14%` / `240 6% 94%` / `270 5% 24%` / `300 34% 15%` | Rail de la consola y panel de marca del login |

El resto de la escala (`--muted-strong`, `--text-subtle/faint/placeholder/divider`,
`--border-subtle/strong`, `--track`, `--seg-thumb`, `--inverse-*`) vive en `tokens.css`.

## Tipografía

Tres familias autoalojadas:

| Token | Valor | Uso |
|---|---|---|
| `--font-sans` | `"Inter", "Inter var", ui-sans-serif, system-ui, sans-serif` | Toda la UI |
| `--font-mono` | `"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace` | Identificadores, wordmark, encabezados de columna |
| `--font-display` | `"Space Grotesk", ui-sans-serif, system-ui, sans-serif` | Títulos de página (eje de peso 300–700) |

Patrones: título de página `font-display text-[26px] font-bold`; encabezado de tabla en mono
11 px, mayúsculas, `tracking-[0.16em]`; cuerpo `text-sm`; apoyo en `--muted-foreground`.

## Espaciado

Escala Tailwind por defecto (múltiplos de 0.25rem): `p-6` en headers/contenidos de tarjeta,
`gap-4` entre bloques, `gap-2`/`gap-1` entre controles.

## Radios y sombras

| Token | Valor |
|---|---|
| `--radius-lg` / `--radius` / `--radius-sm` | `0.75rem` / `0.5rem` / `0.375rem` |
| `--shadow-sm` / `--shadow` / `--shadow-lg` | Claros sobre `222 47% 11%` (5/8/14 %), oscuros sobre negro (40/50/60 %) |

## Reglas de componentes

- **Card**: `rounded-xl border bg-card text-card-foreground shadow`; header `p-6`, content `p-6 pt-0`.
- **Button**: `default`, `secondary`, `outline`, `ghost`, `destructive`; foco visible con `--ring`.
- **Estados de la tabla de usuarios**: punto + texto; `text-success` activo,
  `text-muted-foreground` inactivo, `text-destructive` bloqueado (`lockedUntil` gana sobre
  `isActive`).
- **Valores simulados**: los porcentajes de KPI, la distribución de roles, las filas de
  auditoría y la columna de verificación son placeholders (`—`) a la espera de trabajo de
  `api-user` (COU-347). No son funciones del producto.

## Navegación y artboards

- `Resumen` salió del sidebar; `Inicio` es la primera entrada y apunta a `/app`.
- Artboards: `01-landing`, `02-login`, `03-inicio`, `04-usuarios` (renombrado desde
  `04-resumen`, pendiente de re-export), `05-detalle-usuario`, `06-roles-permisos`,
  `07-sistema`, más `Crear usuario` y `Editar usuario` en el `.fig` (export HTML pendiente).

## Cambiar un token

Cualquier cambio en `tailwind.config.js` (token o clave nueva) exige **reiniciar el dev server
de Vite**: Tailwind genera las utilidades al arrancar, HMR no levanta claves nuevas y las
clases dejan de existir en silencio. Mordió tres veces durante COU-344.
