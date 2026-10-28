# Design system — ui-user

Sincronizado el 2026-10-28 desde las fuentes del proyecto. Cada token nombra su origen. No hay
valores inventados: si algo no aparece acá, no es un token del proyecto.

## Sources

| Path | Qué aporta |
|---|---|
| `src/styles/tokens.css` | Colores (light y `.dark`), radios, sombras, familias tipográficas |
| `tailwind.config.js` | Mapa token → utilidad Tailwind (`hsl(var(--x))`), escala de radios y sombras |

## Color — tema claro

Todos los valores son triples HSL consumidos como `hsl(var(--token))` (`src/styles/tokens.css`).

| Token | Valor | Uso |
|---|---|---|
| `--background` | `0 0% 100%` | Fondo de la app |
| `--foreground` | `222 47% 11%` | Texto principal |
| `--card` / `--card-foreground` | `0 0% 100%` / `222 47% 11%` | Superficie de tarjetas |
| `--muted` / `--muted-foreground` | `210 40% 96%` / `215 16% 45%` | Fondos secundarios y texto de apoyo |
| `--border` / `--input` | `214 32% 91%` | Bordes y contornos de campos |
| `--ring` | `262 83% 58%` | Anillo de foco |
| `--primary` / `--primary-foreground` | `262 83% 58%` / `0 0% 100%` | Acción principal |
| `--primary-hover` | `263 70% 50%` | Hover de la acción principal |
| `--accent` / `--accent-foreground` | `251 100% 96%` / `262 83% 58%` | Selección suave, ítem activo de navegación |
| `--secondary` / `--secondary-foreground` | `210 40% 96%` / `222 47% 11%` | Badges neutros, botones secundarios |
| `--destructive` / `--destructive-foreground` | `347 77% 50%` / `0 0% 100%` | Acción destructiva, error |
| `--success` / `--success-foreground` | `160 84% 39%` / `160 84% 25%` | Estado positivo (definido, hoy sin uso en componentes) |
| `--warning` / `--warning-foreground` | `38 92% 50%` / `38 92% 29%` | Advertencia |
| `--danger` / `--danger-foreground` | `350 89% 60%` / `350 89% 42%` | Estado negativo de entidad |
| `--info` / `--info-foreground` | `199 89% 48%` / `199 89% 33%` | Informativo |

Tema oscuro: `.dark` redefine los mismos tokens (fondo `222 47% 9%`, tarjeta `222 47% 13%`,
primario `255 92% 76%`, etc.). Los artboards muestran el tema claro.

## Tipografía

| Token | Valor | Uso |
|---|---|---|
| `--font-sans` | `"Inter var", Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif` | Toda la UI |
| `--font-mono` | `ui-monospace, SFMono-Regular, "JetBrains Mono", Menlo, Consolas, monospace` | Identificadores, código |

Escala observada en los componentes (`src/features/**`, `src/components/ui/*`), no hay escala
formal en tokens: títulos de página `text-2xl` con `font-semibold` y `tracking-tight`; subtítulos
de sección `text-xl`; cuerpo `text-sm`; apoyo `text-sm` en `--muted-foreground`; encabezado de
tabla `text-xs`/`font-medium` en `--muted-foreground`.

## Espaciado

Escala Tailwind por defecto (múltiplos de 0.25rem). Patrones usados en las páginas existentes:
`p-6` en `CardHeader`/`CardContent`, `gap-4` entre bloques, `gap-2`/`gap-1` entre controles,
`space-y-1.5` en el header de tarjeta.

## Radios

| Token | Valor | Uso |
|---|---|---|
| `--radius-lg` | `0.75rem` | Tarjetas (`rounded-xl` = `lg` extendido) |
| `--radius` | `0.5rem` | Botones, inputs |
| `--radius-sm` | `0.375rem` | Elementos compactos |

## Sombras

| Token | Valor |
|---|---|
| `--shadow-sm` | `0 1px 2px 0 hsl(222 47% 11% / 0.05)` |
| `--shadow` | `0 1px 3px 0 hsl(222 47% 11% / 0.08), 0 1px 2px -1px hsl(222 47% 11% / 0.08)` |
| `--shadow-lg` | `0 10px 24px -6px hsl(222 47% 11% / 0.14), 0 4px 8px -4px hsl(222 47% 11% / 0.08)` |

## Reglas de componentes

- **Card** (`src/components/ui/card.tsx`): `rounded-xl border bg-card text-card-foreground shadow`;
  header `flex flex-col space-y-1.5 p-6`; content `p-6 pt-0`.
- **Button** (`src/components/ui/button.tsx`): variantes `default` (primario), `secondary`,
  `outline`, `ghost`, `destructive`; tamaños `sm`, `default`, `icon`. Foco visible con `--ring`.
- **Badge** (`src/components/ui/badge.tsx`): `default` (primario) y `outline`; el listado de
  usuarios lo usa para rol (`secondary`) y estado (`default`/`outline`).
- **Inputs/Select**: borde `--input`, radio `--radius`, foco con `--ring`.
- **Definición término/valor**: `dt` en `--muted-foreground`, `dd` en `--foreground` con
  `font-medium`; separadores con `--border`.
- **Estados de datos**: carga con live region, error con `ErrorView` (borde y fondo
  `--destructive`), vacío con texto `--muted-foreground`.

## Observations for the next iteration

- `--success`, `--warning` y `--info` están definidos y sin uso: los estados de entidad hoy se
  pintan con `default`/`outline`. Una mejora visual legítima es adoptarlos (activo → success,
  bloqueado → warning/danger).
