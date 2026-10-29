# design/ — índice

Inventario visual del proyecto. Cualquier sesión (humana o de Pi) puede leerlo en solo
lectura para saber **qué está vigente, qué está propuesto y de dónde salen los valores**.
Esta carpeta describe y propone: nunca define el valor que el código aplica.

## Fuente de verdad

| Dato | Fuente |
|---|---|
| Valores de tokens (color, radios, sombras, tipografía) | `src/styles/tokens.css`, expuesto a las utilidades por `tailwind.config.js` |
| Reglas, contraste y guardas que protegen esos valores | `docs/design-system.md` |
| Estado visual y propuesta de rebranding | esta carpeta (`design/`) |

Regla de lectura: si `design/` y `src/styles/tokens.css` no coinciden, **gana
`tokens.css`** y esta carpeta tiene un defecto que hay que corregir.

## Estado de cada entrada

| Path | Estado | Qué es |
|---|---|---|
| `README.md` | vigente | este índice |
| `system.md` | vigente | sistema de diseño tal como está **en código**: violeta `262 83% 58%`, tokens de `src/styles/tokens.css` y reglas de los componentes reales |
| `app/` | **propuesto, no implementado** | rebranding de Countergank (COU-342): 7 artboards, tokens propuestos, paleta y tipografías |

### `design/app/` — propuesto, no implementado

Nada de esta carpeta está aplicado al código todavía. La implementación es COU-344; hasta
que ese ticket cierre, el aspecto real de la aplicación es el que describe `system.md`.

| Artboard | Pantalla |
|---|---|
| `01-landing.html` | Landing pública |
| `02-login.html` | Inicio de sesión |
| `03-inicio.html` | Inicio de la consola |
| `04-resumen.html` | Resumen de usuarios |
| `05-detalle-usuario.html` | Detalle de usuario |
| `06-roles-permisos.html` | Roles y permisos |
| `07-sistema.html` | Sistema |

**Landing canónica: `design/app/01-landing.html`.** Es la única landing del repositorio. La
pantalla `03-inicio.html` es el inicio de la consola autenticada, no una segunda landing.

Archivos de soporte:

| Path | Qué es |
|---|---|
| `design/app/design.json` | Título, brief, artboards con sus tradeoffs y el bloque `source` que ata este snapshot al `.fig` |
| `design/app/tokens-app.css` | Paleta clara propuesta, token por token, en triples HSL; lista para reemplazar los valores de `src/styles/tokens.css`. Incluye los cuatro tokens de chrome (`--sidebar*`) |
| `design/app/tokens-dark.css` | Paleta **oscura** propuesta (63 tokens, base Radix Colors: `mauve` neutros, `plum` marca, `grass`/`amber`/`red`/`blue` estados). Formato `.dark` listo para `src/styles/tokens.css` |
| `design/app/palette-dark.html` | Tablero autocontenido de la paleta oscura: 63 muestras con token, hex y HSL, más la tabla de contraste (25 pares AA) |
| `design/app/palette.json` | Los 46 colores que usan los artboards claros, cada uno con su token y grupo |
| `design/app/fonts.css` | `@font-face` de las tres familias |
| `design/app/fonts/` | Inter, Space Grotesk y JetBrains Mono como woff2 variables (subset latin) con sus licencias SIL OFL |

### Modos claro y oscuro en el `.fig`

El archivo de diseño tiene una colección de variables `Tokens` con **dos modos, `Light` y `Dark`**, y los rellenos y trazos de las siete pantallas están atados a esas variables. El modo se aplica **por capa o por página** (control *Apply variable mode*): la colección por sí sola no repinta el lienzo.

Los valores viven en dos archivos versionados, uno por modo, y el propio archivo los puede emitir como CSS condicional:

| Modo | Archivo |
|---|---|
| Claro | `design/app/tokens-app.css` |
| Oscuro | `design/app/tokens-dark.css` |

`design_to_tokens` sobre la colección devuelve `:root` con los valores claros y `@media (prefers-color-scheme: dark)` con los oscuros, así que la implementación puede salir del propio diseño en vez de transcribirse a mano.

Verificación: **25/25 pares AA** en la paleta y **710 textos medidos en contexto oscuro sin fallas**. Los artboards HTML versionados son del tema claro; el oscuro se revisa en `palette-dark.html` y aplicando el modo en el archivo.

## Trazabilidad del master editable

El master (`.fig`) **no se versiona**: vive fuera del repositorio, en MEGA, y git no puede
atarlo a los HTML publicados. El bloque `source` de `design/app/design.json` cubre ese hueco:

```json
"source": {
  "fig": "Dashboard User UI.fig",
  "sha256": "<hash del .fig al momento de exportar>",
  "sizeKb": 265.8,
  "exportedAt": "2026-10-28",
  "tool": "openpencil 0.15.1"
}
```

### Flujo de re-export

1. Editar el `.fig` en `MEGA/Professional/Countergank/designs/Dashboard User UI.fig`.
2. Re-exportar los artboards a `design/app/*.html` con el CLI de OpenPencil.
3. Calcular el hash del master y compararlo con el registrado:

   ```bash
   sha256sum "<ruta al master .fig en MEGA>"
   ```

4. Actualizar en `design/app/design.json` el bloque `source`: `sha256`, `sizeKb` (bytes / 1024),
   `exportedAt` y `tool` (`openpencil --version`).
5. Commitear juntos los HTML exportados, los recursos que cambiaron y el `source` nuevo.

Si el hash del `.fig` no coincide con el registrado, los HTML versionados están
desactualizados: re-exportar antes de usarlos como referencia.

## Diseños retirados

Se retiraron en COU-345 (2026-10-28) para dejar una sola convención:

| Path | Por qué se retiró | Reemplazo |
|---|---|---|
| `design/users-detail/` | Tres direcciones de exploración de COU-291, ya implementadas | `design/app/05-detalle-usuario.html` |
| `designs/` (`designs/identity/index.html`) | Convención plural heredada; se leía como fuente de valores siendo un boceto | `design/system.md` para lo vigente, `design/app/tokens-app.css` para lo propuesto |
| `design/system.html` | Replicaba en HTML los mismos valores de `system.md` | `design/system.md` |

El historial visual de esas exploraciones sigue disponible en `git log -- design/` y en los
ODD de COU-270, COU-291 y COU-342.
