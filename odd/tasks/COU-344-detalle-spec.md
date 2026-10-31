# COU-344 · Spec del artboard `05-detalle-usuario.html`

Extraída del export de OpenPencil parseando las reglas `.op-*`. Fuente cruda:
`.temp/05-tree.txt` (123 nodos con texto). Frame 1440×1360, sidebar 248px, contenido 1192px.

Colores de referencia: texto principal `rgb(17,17,20)` · etiqueta `rgb(138,138,152)` ·
micro `rgb(110,110,122)` · acento violeta `rgb(139,42,130)` · verde `rgb(30,122,77)` ·
rojo destructivo `rgb(179,38,30)` · chip de fondo `rgb(244,238,248)`.

## 1. Breadcrumb (topbar)

`Administración` (Inter 13/400, `138,138,152`) › `Usuarios` (idem) › `Leandro Cepeda`
(Inter 13/500, `17,17,20`). A la derecha de la topbar: buscador
`Buscar nombre, email o @usuario` (Inter 12.5/400), selector `ES` con badge `3`
(JetBrains Mono 11/700), avatar `LC` (violeta `139,42,130`).

## 2. Encabezado de la página

- Avatar grande `LC` (violeta) + nombre **`Leandro Cepeda`** en Space Grotesk 24/700.
- Bajo el nombre: chip `admin` (JetBrains Mono 10.5/400, violeta) y chip `Activo`
  (JetBrains Mono 10.5/400, verde `30,122,77`).
- Línea secundaria: `@lcepeda · leandro@countergank.dev` (Inter 12.5/400, `110,110,122`).
- Botón `Editar` (Inter 13/500) a la derecha.
- Título de página: **`Detalle de usuario`** en Space Grotesk 26/700.
- Subtítulo: `Ficha, permisos y acciones administrativas` (Inter 13/400, `110,110,122`).

## 3. Card `Perfil`

- Título `Perfil` (Inter 14/500) + a la derecha `actualizado hace 2 min` (Inter 11/400).
- Grilla de dos columnas. Etiqueta Inter 12/400 `138,138,152`; valor Inter 12.5/500
  `17,17,20`; `Nombre de usuario` y `Rol` en JetBrains Mono 11.5/500.
- Campos: `Nombre` · `Apellido` · `Nombre de usuario` · `Email` · `Rol` · `Creado` ·
  `Actualizado`. Fechas con formato `11 ene 2024 · 09:12`.

## 4. Card `Permisos efectivos`

- Título `Permisos efectivos` (Inter 14/500) + `22 heredados del rol + 2 directos`
  (Inter 11/400).
- `Directos:` (Inter 11/400) seguido de chips violetas: `user:unlock`, `audit:read`
  (JetBrains Mono 10.5/400 sobre `244,238,248`, radio chico).
- Grupo `USER` (JetBrains Mono 10/400) + `5 heredados` (JetBrains Mono 10/400, `110,110,122`):
  `user:create`, `user:read`, `user:update`, `user:delete`, `user:unlock`.
- Grupo `SYSTEM` + `17 heredados`: `role:create`, `role:read`, `role:update`, `role:delete`,
  `permission:create`, `permission:read`, `permission:update`, `permission:delete`,
  `parameter:read`, `parameter:update`, `audit:read`, `email:read`, `email:create`,
  `email:update`, `email:delete`, `email:send`, `i18n:reload`.

## 5. Card `Sesiones y seguridad`

- Título + `sessionEpoch 4` (JetBrains Mono 11/400) a la derecha.
- Filas etiqueta/valor: `Último acceso` → `28 feb 2026 · 16:41 · 190.12.4.7` ·
  `Sesiones activas` → `2 dispositivos` · `Bloqueo` → `sin bloqueo (lockedUntil —)` ·
  `Intentos fallidos` → `0`.
- Botón primario `Cerrar todas las sesiones` + hint `POST /auth/logout-all · invalida todos
  los refresh` (Inter 10.5/400).

## 6. Card `Acciones de administración`

Filas con etiqueta a la izquierda y el verbo HTTP a la derecha (JetBrains Mono 9/400):

| Acción | Verbo |
| --- | --- |
| `Desbloquear cuenta` | PATCH |
| `Desactivar usuario` | PATCH |
| `Restablecer contraseña` | POST |
| `Reenviar verificación` | POST |
| `Cambiar email (2 pasos)` | POST |
| `Eliminar usuario` (rojo `179,38,30`) | DELETE |

## 7. Card `Estado de la cuenta`

Título + `email verificado` (JetBrains Mono 10.5/400, verde). Filas: `Email pendiente` → `—` ·
`Reset de contraseña` → `sin token activo` · `Verificación` → `consumida · 12 ene 2024`.

## 8. Card `Actividad del usuario`

Título + `Ver todo` (Inter 11/400) a la derecha. Filas: nombre del evento en JetBrains Mono
11/400 (`user.update`, `auth.login`, `user.unlock`), debajo `200 · 84ms · 190.12.4.7`
(Inter 10.5/400), y a la derecha el tiempo relativo (`hace 2 min`, `hace 3 h`, `ayer`).

## Qué datos existen hoy

`UserDTO` trae: `id`, `name`, `lastName`, `email`, `userName`, `role`, `isActive`,
`createdAt`, `updatedAt`, `lockedUntil`, `failedLoginAttempts`.

**No existen** en `api-user`: permisos efectivos (heredados/directos), sesiones activas,
`sessionEpoch`, último acceso con IP, estado de tokens de reset y verificación, ni actividad.

Por decisión del humano (`L23`): esas secciones **se renderizan igual al diseño** con `—` en los
valores y los botones deshabilitados, y el backend se construye después.
