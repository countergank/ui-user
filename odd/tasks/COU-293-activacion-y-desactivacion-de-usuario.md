# COU-293 — Construir la activación y desactivación de usuario

Feature: toggle de estado activo del usuario desde el listado y el detalle, con
`AlertDialog` de confirmación, protección de auto-desactivación, toast e invalidación
de caché. Branch `feature/cou-293-construir-la-activacion-y-desactivacion-de-usuario`.

## Specs

- S1: "Acción desde el listado y desde el detalle."
- S2: "Confirmación con `AlertDialog`."
- S3: "Protección para no desactivar el propio usuario."
- S4: "`AlertDialog` con título, cuerpo y botones confirmar/cancelar."
- S5: "El botón refleja el estado actual (activar o desactivar)."
- S6: "`users.active.confirmTitle`, `users.active.confirmBody`, `users.active.deactivate`, `users.active.activate`, `users.active.success`, `users.active.selfBlocked`." — "Claves presentes en los tres idiomas."
- S7: "Confirmación explícita antes de aplicar el cambio."
- S8: "No se puede desactivar el propio usuario (mensaje claro)."
- S9: "Toast de resultado e invalidación de listado y detalle."
- S10: "Test con MSW y test axe."
- S11: "Contrato: `PATCH /admin/users/:id/active`." Verificado en `api-user/src/user/controller/user.controller.ts`: toggle **sin body**, `RequirePermissions('user:update')`, responde `AdminUserDTO` (mismo shape que `userSchema`).
- S12: "Cumple CV1-CV10. Depende de U06, U07, U09 y U10." (U06/U07/U09/U10 ya construidos: listado, alta, detalle; convenciones del épico aplicadas por el código existente.)

## Tasks

- T1 | S11 | API `toggleUserActive`: PATCH toggle sin body, valida respuesta con `userSchema` | commit pendiente
- T2 | S9 | Hook `useToggleUserActive`: setea caché del detalle con la respuesta, invalida el listado | commit pendiente
- T3 | S2, S4, S5, S7 | Componente `ActiveConfirmDialog` (AlertDialog confirmar/cancelar, texto según estado) compartido por listado y detalle | commit pendiente
- T4 | S3, S8 | Guard de auto-desactivación: bloquea con `users.active.selfBlocked` y no abre el diálogo ni muta | commit pendiente
- T5 | S1, S5 | Listado: botón Power de `users-columns.tsx` habilitado y diálogo alojado en `users-page.tsx` | commit pendiente
- T6 | S1, S5 | Detalle: `AdminActionsCard` refleja activar/desactivar según `user.isActive` y dispara el diálogo | commit pendiente
- T7 | S6 | Claves `users.active.*` en `en.ts`, `es.ts`, `pt.ts` (parity.test verde) | commit pendiente
- T8 | S10 | Tests MSW: `active-confirm-dialog.integration.test.tsx` (11), flujo en `users-page.integration.test.tsx` (3) y `users-detail-page.integration.test.tsx` (2) + axe | commit pendiente

## Log

- L1 (usuario, verbatim): "usa kickoff para ver con que deberiamos seguir teoricamente" → selección de ticket; luego: "excelente! Vamos con activacion y desactivacion de usuario" (COU-293, Linear, estimate 2, asignado a Leandro Javier Cepeda).
- L2: Ticket movido a In Progress y rama `feature/cou-293-construir-la-activacion-y-desactivacion-de-usuario` creada desde `origin/develop` con el `branchName` exacto de Linear.
- L3: Contrato verificado contra `api-user`: `PATCH /admin/users/:id/active` es toggle sin body y responde `AdminUserDTO`; el cliente valida con `userSchema` y no envía payload.
- L4: Decisión de UX del guard (S3/S8): al intentar desactivar el propio usuario se muestra `toast.error(users.active.selfBlocked)` y no se abre el diálogo; el guard también vive en el hook.
- L5: Verificación completa: `pnpm test` 662/662, `pnpm lint` limpio, `pnpm typecheck` limpio, `pnpm build` ok. El test de detalle destapó que la invalidación refresca el detalle vía GET; el handler del test simula el backend con estado.
- L6: Commit pendiente de autorización explícita del humano (AGENTS.md); propuesto: `feat(users): add the active toggle with confirmation dialog (COU-293)`.
