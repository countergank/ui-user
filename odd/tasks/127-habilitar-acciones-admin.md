# 127 — Habilitar acciones administrativas pendientes en el detalle de usuario

Feature: habilitar las acciones pendientes de `admin-actions-card.tsx` contra los endpoints
existentes de api-user. Issue: countergank/ui-user#127. Branch: `feature/127-habilitar-acciones-admin`
(base `origin/develop`).

## Specs

- S1: "Reset de password vía `POST /admin/users/:id/reset-password` con confirmación y resultado visible según contrato."
- S2: "Reenvío de verificación vía `POST /admin/users/:id/resend-verification` con feedback."
- S3: Cablear cambio de email por admin vía `POST /admin/users/:id/change-email` (body `{email}`), con diálogo de confirmación, cancelación del pedido pendiente vía `DELETE /admin/users/:id/change-email` cuando `hasPendingEmailChange`, y errores 4xx visibles. (Reemplaza el AC original ""Cambiar email" queda deshabilitado con mensaje que referencia el ticket de backend." — ver L2.)
- S4: ""Eliminar usuario" remite a #53 (no se duplica)."
- S5: "Manejo de errores `4xx` visible en cada acción."
- S6: La fila "Reenviar verificación" queda deshabilitada cuando `user.emailVerified === true`, con tooltip que lo explica (origen: "me muestra ocurrio un error ineesperado" al reenviar verificación a un email ya verificado — el backend responde 400 `VALIDATION_ERROR` por diseño).
- S7: Los toasts de error de los cuatro diálogos nuevos muestran el `message` del `AppError` (mensaje traducido del backend) con fallback al genérico (origen: "dale vamos con ambos").

Non-goals (del issue): cambios en api-user; eliminar usuario (es #53 y queda deshabilitado remitiendo a #53).

## Tasks

- T1 · S1 · API `resetPassword` + hook + confirm dialog + wiring en `admin-actions-card.tsx` + i18n (es/en/pt) + tests · done (sin commit aún)
- T2 · S2 · API `resendVerification` + hook + confirm dialog + wiring + i18n + tests · done (sin commit aún)
- T3 · S3 · API `requestEmailChange`/`cancelEmailChange` + hooks + email-change dialog (input validado, estado pendiente, cancelación) + wiring + i18n + tests · done (sin commit aún)
- T4 · S4 · Fila "eliminar usuario" deshabilitada remitiendo a #53 (sin duplicar) · done (sin commit aún)
- T5 · S5 · Errores 4xx visibles por acción (cubiertos en T1–T3; verificación final) · done: suite 1071/1071, lint, typecheck, build y coverage 97.9/94.04 (sin commit aún)
- T6 · S6 · Deshabilitar reenvío de verificación para email ya verificado + tooltip + i18n + tests · done: tests de página 30/30 (sin commit aún)
- T7 · S7 · Toast de error con mensaje real del AppError en los 4 diálogos nuevos + tests · done: suite 1073/1073, lint, typecheck, build (sin commit aún)

## Log

- L1: "vamos" (tras kickoff de #127 presentado; autoriza la implementación del issue en `feature/127-habilitar-acciones-admin`).
- L2: Decisión del usuario 2026-11-22: el backend ya expone `POST /admin/users/:id/change-email` (+ `DELETE` para cancelar), y el usuario eligió "Cablearlo ahora" en lugar del AC original de dejarlo deshabilitado. S3 reescrito; el no-objetivo "Cambiar email: bloqueado hasta que api-user exponga el cambio por admin" queda anulado.
- L3: Verificación final (T5): `pnpm test` 1071/1071 · `pnpm lint` limpio · `pnpm typecheck` limpio · `pnpm build` ok · `pnpm test:coverage` 97.9% líneas / 94.04% branches (floor 80). Errores 4xx cubiertos por test por acción: reset 403, resend 409, change-email 409, cancel 409.
- L4: Reporte del usuario: "me muestra ocurrio un error ineesperado" al reenviar verificación a countergank.ti@gmail.com. Diagnóstico: el backend rechaza con 400 `VALIDATION_ERROR` ("Email already verified", `user.service.ts:656`) cuando la cuenta no tiene `emailVerificationToken` (== `emailVerified: true`), y la UI descartaba el mensaje real mostrando el genérico. Decisión del usuario: "dale vamos con ambos" — implementar prevención (S6) y mensaje real (S7).
- L5: Verificación final (T6–T7): `pnpm test` 1073/1073 · `pnpm lint` limpio · `pnpm typecheck` limpio · `pnpm build` ok. S6 cubierto con tests de página para verificado (deshabilitada + tooltip) y no verificado (habilitada); S7 cubierto con tests que exigen el mensaje del backend en los 4 diálogos.
