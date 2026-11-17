# 118-reversion-cambio-email — Pantalla de reversión de cambio de email

Implementa #118: la pantalla pública que abre el botón «Revertir el cambio» del aviso
que llega al email anterior tras confirmar un cambio de email (`/revert-email-change?token=…`,
hoy NOT FOUND). Es el espejo de la pantalla de confirmación (#116) y el último eslabón
del flujo de cambio de email.

## Specs

- S1 (de #118): «El aviso que llega al email anterior tras confirmar un cambio de email
  incluye un botón "Revertir el cambio" que apunta a `/revert-email-change?token=…`
  (`api-user` `email.listener.ts:134`), dentro de la ventana de reversión de 72 h.»
- S2: «Ruta pública `/revert-email-change?token=...`, sin sesión activa (el dueño de la
  bandeja anterior puede estar deslogueado).»
- S3: «Contrato: `POST /auth/revert-email-change` con el token de la URL. Éxito 200;
  token inválido → `UA-SEC-001`/`INVALID_TOKEN`; fuera de la ventana de 72 h → 410
  `UA-AUTH-011` `EMAIL_REVERT_WINDOW_EXPIRED`.»
- S4: «Estados: éxito (email revertido, CTA a login), token inválido, y ventana
  expirada (410 `UA-AUTH-011`) muestra su estado dedicado, distinto del token inválido.»
- S5: «Diseño: `Card` centrada con ícono de estado, título y mensaje — mismo patrón que
  `confirm-email-page.tsx` (#116).»
- S6: i18n namespace `auth`: `auth.emailRevert.title`, `auth.emailRevert.success`,
  `auth.emailRevert.goToLogin`, `auth.emailRevert.invalidTokenTitle`,
  `auth.emailRevert.errors.invalidToken`, `auth.emailRevert.errors.windowExpired`
  (+ su título de estado si aplica), en los tres idiomas.
- S7: «Test con MSW y test axe.» «Claves presentes en los tres idiomas.»
- S8: la confirmación dispara exactamente una vez por token al montar, sin loops
  (lección de #116: no depender de `isPending`/`isSuccess` de la mutación; patrón
  `firedForToken` + `settled`).

## Tasks

- T1 (S3) `src/features/auth/api.ts`: `revertEmailChange(token)` POST
  `/auth/revert-email-change` + test en `api.test.ts`.
- T2 (S6,S7) claves `auth.emailRevert.*` en `en.ts`/`es.ts`/`pt.ts` (paridad).
- T3 (S1,S2,S4,S5,S7,S8) `revert-email-page.tsx` (patrón `confirm-email-page.tsx`,
  estados éxito/token inválido/ventana expirada) + test integración MSW + axe con
  test de única-ejecución por token y caso 410.
- T4 (S1,S2) ruta pública `/revert-email-change` + `revert-email-change-route.tsx` +
  actualizar `src/routes/routes.test.tsx` (lista exacta de rutas públicas).

## Log

- L1 (usuario): «vamos con kickoff» → kickoff: #118 por continuidad con #116; #60
  cerrado como cubierto por #116 (PR #119). Rama
  `feature/118-reversion-cambio-email` desde `origin/develop` actualizado
  (`--no-track`), board #118 In Progress (est. 2, asignado). #554 (api-user) queda
  para después.
