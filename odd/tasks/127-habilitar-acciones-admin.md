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

- T1 · S1 · API `resetPassword` + hook + confirm dialog + wiring en `admin-actions-card.tsx` + i18n (es/en/pt) + tests · commit 113b581
- T2 · S2 · API `resendVerification` + hook + confirm dialog + wiring + i18n + tests · commit 113b581
- T3 · S3 · API `requestEmailChange`/`cancelEmailChange` + hooks + email-change dialog (input validado, estado pendiente, cancelación) + wiring + i18n + tests · commit 113b581
- T4 · S4 · Fila "eliminar usuario" deshabilitada remitiendo a #53 (sin duplicar) · commit 113b581
- T5 · S5 · Errores 4xx visibles por acción (cubiertos en T1–T3; verificación final) · commit 113b581
- T6 · S6 · Deshabilitar reenvío de verificación para email ya verificado + tooltip + i18n + tests · commit 113b581
- T7 · S7 · Toast de error con mensaje real del AppError en los 4 diálogos nuevos + tests · commit 113b581

Entrega como commit único (1765 líneas autorizadas por el usuario): los archivos de las siete tareas se intercalan (card, locales y tests de página tocan todas las acciones a la vez), por lo que partir por tarea exigiría staging parcial artificial. Slice boundary registrado aquí; el feature cierra con este commit.

## Log

- L1: "vamos" (tras kickoff de #127 presentado; autoriza la implementación del issue en `feature/127-habilitar-acciones-admin`).
- L2: Decisión del usuario 2026-11-22: el backend ya expone `POST /admin/users/:id/change-email` (+ `DELETE` para cancelar), y el usuario eligió "Cablearlo ahora" en lugar del AC original de dejarlo deshabilitado. S3 reescrito; el no-objetivo "Cambiar email: bloqueado hasta que api-user exponga el cambio por admin" queda anulado.
- L3: Verificación final (T5): `pnpm test` 1071/1071 · `pnpm lint` limpio · `pnpm typecheck` limpio · `pnpm build` ok · `pnpm test:coverage` 97.9% líneas / 94.04% branches (floor 80). Errores 4xx cubiertos por test por acción: reset 403, resend 409, change-email 409, cancel 409.
- L4: Reporte del usuario: "me muestra ocurrio un error ineesperado" al reenviar verificación a countergank.ti@gmail.com. Diagnóstico: el backend rechaza con 400 `VALIDATION_ERROR` ("Email already verified", `user.service.ts:656`) cuando la cuenta no tiene `emailVerificationToken` (== `emailVerified: true`), y la UI descartaba el mensaje real mostrando el genérico. Decisión del usuario: "dale vamos con ambos" — implementar prevención (S6) y mensaje real (S7).
- L5: Verificación final (T6–T7): `pnpm test` 1073/1073 · `pnpm lint` limpio · `pnpm typecheck` limpio · `pnpm build` ok. S6 cubierto con tests de página para verificado (deshabilitada + tooltip) y no verificado (habilitada); S7 cubierto con tests que exigen el mensaje del backend en los 4 diálogos.
- L6: Commit autorizado por el usuario ("vamos") y ejecutado: `113b581` feat(users): enable admin actions in user detail — 18 archivos, +1731/−34. PUSH y PR quedan como decisión pendiente del usuario.
- L7: Review nativo RDD iniciado sobre el target (lineage `review-ebacf541ce498b54`, tier medium, lentes risk/resilience/reliability, presupuesto 200). La captura de resultados falló dos veces por defecto del proveedor ("Provider collectBinding collides with a different registered route" / "capture-route-registration-rejected · selector-mismatch"), sin ejecutar runs ni mutar autoridad. Disposición del usuario: "intentamos de nuevo si fallo el review, si se encuentran hallazgos los resolvemos commiteamos y pushgeamos" — se reintentó, falló de nuevo, no hubo hallazgos que resolver; se procede con push. La autoridad queda abierta en estado reviewing.
- L8: Push ejecutado (`feature/127-habilitar-acciones-admin` → origin, 3 commits: 113b581, 221e08f, afe7331). PR #142 abierto contra develop ("feat(users): enable admin actions in user detail", Refs #127) con autorización del usuario ("sí"); board movido a In Review.
- L9: Registro L8 commiteado y pusheado (26de493, "docs(users): record pr 142 in the 127 ODD log"). PR #142 mergeado a develop (f2bfc27, 2026-11-25) con autorización explícita del usuario; issue #127 cerrado, board movido a Done, rama remota eliminada por GitHub y rama local borrada tras actualizar develop. Feature cerrado.

Cierre: el ODD queda con este registro final; el commit del cierre no se crea porque la rama ya no existe y el registro vive en el historial del merge (f2bfc27).
