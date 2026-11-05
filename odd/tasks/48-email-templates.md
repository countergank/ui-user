# 48 — Gestión de plantillas de email

Feature: construir la gestión de plantillas de email en ui-user (issue countergank/ui-user#48, COU-300).
Branch: `feature/48-gestion-plantillas-email` · Board: In Progress · Estimate: 3

## Specs

- S1: "Contratos: `GET /email/templates`, `POST /email/templates`, `GET /email/templates/:slug`, `PATCH /email/templates/:slug`, `DELETE /email/templates/:slug` (**204, sin cuerpo**) y `POST /email/send` para pruebas."
- S2: "Ruta `/admin/email-templates`." (Ver Log L2: se implementa como `/app/settings/email-templates` según la navegación existente de la consola.)
- S3: "Listado, creación, edición y eliminación de plantillas."
- S4: "Previsualización y envío de prueba."
- S5: "`Table` de plantillas con acciones."
- S6: "Editor con asunto y cuerpo, y lista visible de variables disponibles."
- S7: "Previsualización en `Sheet`."
- S8: "Borrado con `AlertDialog`."
- S9: i18n namespace `email`: "`email.templates.title`, `email.templates.columns.*`, `email.templates.editor.subject|body`, `email.templates.variables`, `email.templates.actions.preview|test|delete|create|edit`, `email.templates.success`, `email.templates.empty`, `email.templates.testSuccess`."
- S10: "El listado muestra las plantillas con sus acciones."
- S11: "Las variables disponibles son visibles en el editor."
- S12: "La previsualización renderiza con datos de ejemplo."
- S13: "El `DELETE` maneja correctamente el 204 **sin cuerpo**."
- S14: "El envío de prueba da feedback claro."
- S15: "Respeta los permisos `email:*`."
- S16: "Test con MSW y test axe."
- S17: "Claves presentes en los tres idiomas."

## Tasks

- T1 [S1,S13] API client + tipos: `features/email-templates/api.ts` con los 5 contratos + `POST /email/send`, manejo del 204 sin cuerpo. Route: inline. Commit: pendiente de autorización.
- T2 [S3,S5,S10,S15] Listado `/app/settings/email-templates`: tabla con acciones, paginación según molde de usuarios, permisos `email:*`, entrada de nav habilitada. Route: inline. Commit: pendiente de autorización.
- T3 [S3,S6,S11] Editor create/edit: asunto, cuerpo, lista visible de variables, validación con schema. Route: inline. Commit: pendiente de autorización.
- T4 [S4,S7,S12,S14] Preview en `Sheet` con datos de ejemplo + envío de prueba con feedback. Route: inline. Commit: pendiente de autorización.
- T5 [S3,S8,S13] Borrado con `AlertDialog`, manejo del 204. Route: inline. Commit: pendiente de autorización.
- T6 [S9,S17] Claves i18n `email.templates.*` en `es`, `en`, `pt` + namespace nav. Route: inline. Commit: pendiente de autorización.
- T7 [S16] Verificación: tests MSW + axe por pantalla, `pnpm lint`, `pnpm typecheck`, suite completa. Route: inline. Commit: pendiente de autorización.

## Log

- L1 (L1 verbatim): "Usemos la skill kickoff para ver con que seguir" → análisis de gaps y alta de tickets de backend (api-user #532–#536); elección de #48 en ui-user; Estimate 3 confirmado; board In Progress; branch creada desde origin/develop.
- L2: El issue S2 dice "Ruta `/admin/email-templates`" (migrado de Linear COU-300), pero `src/features/console/navigation.ts` ya declara la entrada `/app/settings/email-templates` (`implemented: false`) y todas las rutas de consola viven bajo `/app/*`. Decisión: implementar en `/app/settings/email-templates` y habilitar esa entrada; `/admin/...` es la convención del backend, no de este frontend.
- L3: El backend ya expone todo el CRUD (verificado en countergank/api-user: `src/email/controller/email-template.controller.ts`, `email.controller.ts`): ningún ticket de backend bloquea este issue.
- L4: Implementación completa (T1–T7). Verificación: `make ci` local en verde (Biome + ESLint, typecheck estricto, suite con cobertura, build); 17 tests del módulo (MSW + axe) en verde; paridad i18n en/es/pt en verde. Riesgo: none — cambio aditivo de UI; lo único preexistente que toca es la entrada de nav (`implemented: false` → habilitada), que es el cambio pedido, y su test actualizado.
- L5: Commits pendientes de autorización explícita (regla del repo): se propuso partir en 3 work-unit commits sobre `feature/48-gestion-plantillas-email`.
- L6: Incidencia reportada por el usuario ("no está accesible la pantalla de templates, da error"). Diagnóstico con reproducción en navegador real (Playwright contra dev server :3001): `GET /email/templates` respondía 200 pero con el HTML del SPA — `/email` no estaba en el proxy de `vite.config.ts` (solo `/admin` y `/auth`), así que el dev server servía el fallback del SPA y el parse del cliente explotaba. No era CORS del todo: el cambio de puerto del dev server a 3001 (PR #37) tampoco estaba cubierto por `CORS_ORIGINS`; el usuario agregó el origen en environment/Doppler. Fix aplicado en `vite.config.ts`: proxy para `/email`, `/users`, `/roles`, `/permissions`. Verificado end-to-end: login + navegación + listado con las 7 plantillas seeded renderizando.
