# 116-corregir-ruta-confirmacion-email — Ruta de confirmación de cambio de email

Implementa #116: el link «Confirmar cambio de email» del correo abre `/confirm-email?token=…`
en el frontend (NOT FOUND hoy). Corrige la discrepancia de ruta contra el spec de #60
(decisión L2: `/confirm-email` es la fuente de verdad) y construye la pantalla de
confirmación con token que #60 pide, sobre la ruta del correo real.

## Specs

- S1: «El link "Confirmar cambio de email" que envía el backend abre
  `/confirm-email?token=…`, una ruta inexistente en el frontend (NOT FOUND), y además
  difiere de la ruta que el spec de #60 pide (`/confirm-email-change?token=…`).»
- S2: «Esperado: el link abre la pantalla de confirmación de cambio de email (#60):
  `POST /auth/confirm-email-change` con el token de la URL, estados de éxito y de token
  inválido/expirado, sin sesión activa.»
- S3: «Bloquea el paso final del flujo de cambio de email: el cambio queda pendiente para
  siempre y el usuario no tiene forma de completarlo desde el correo.»
- S4 (de #60): «Ruta `/confirm-email-change?token=...`» → **decisión L2**: la ruta real
  es `/confirm-email?token=...` (la que genera `email.listener.ts:82` y llega al inbox);
  la UI se alinea al correo, el backend no se toca.
- S5 (de #60): «Estados de éxito y de token inválido/expirado.»
- S6 (de #60): «No requiere sesión activa.»
- S7 (de #60): «Card centrada con ícono de estado, título y mensaje.»
- S8 (de #60): «CTA a login.»
- S9 (de #60, i18n namespace `auth`): `auth.emailChange.title`, `auth.emailChange.success`,
  `auth.emailChange.errors.invalidToken`, `auth.emailChange.goToLogin`.
- S10 (de #60): «Test con MSW y test axe.» «Claves presentes en los tres idiomas.»
- S11 (de #60): «La pantalla funciona sin sesión activa.»

## Tasks

- T1 (S1,S2) `src/features/auth/`: `confirmEmailChange(token)` POST
  `/auth/confirm-email-change` + test (TDD). ✔
- T2 (S8,S9,S10) claves `auth.emailChange.*` en `en.ts`/`es.ts`/`pt.ts`. ✔
- T3 (S4,S5,S6,S7,S9,S10,S11) `confirm-email-page.tsx` (Card centrada, POST al montar
  con el token de `useSearchParams`, estados éxito/error, CTA login sin sesión) + test
  integración MSW + axe. ✔
- T4 (S1) ruta pública `/confirm-email` en `src/routes/index.tsx` (fuera del layout
  autenticado, junto a `/reset-password`) + test de rutas actualizado. ✔
- T5 (S1) decisión de ruta documentada en #60 (comentario). ✔

## Log

- L1 (usuario): «vamos» → kickoff de #116: rama
  `feature/116-corregir-ruta-confirmacion-email` desde `origin/develop` (`--no-track`),
  board #116 In Progress (est. 2, asignado).
- L2 (usuario, selección): fuente de verdad de la ruta = `/confirm-email` (la del correo
  real, generada por `email.listener.ts:82`); la UI se alinea al correo y el backend no
  se toca. El spec de #60 (`/confirm-email-change`) queda superado por esta decisión.
- L3 la entrada L12 del cierre de #57 (docs ODD) quedó sin pushear en develop (prohibido
  el push directo); viaja en el primer commit de docs de esta rama.
- L4 verificación (Node 22): suite completa 957/957 (exit 0), lint 0, typecheck OK,
  build OK. El test de rutas públicas (`routes.test.tsx`) exigía la lista exacta de
  rutas y hubo que agregarle `/confirm-email`. Comentario de decisión publicado en
  #60 (issuecomment-6926387482).
