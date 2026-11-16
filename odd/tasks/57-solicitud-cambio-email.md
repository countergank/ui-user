# 57-solicitud-cambio-email — Sección de solicitud de cambio de email en Mi perfil

Implementa #57 (COU-287): sección dentro de `/profile` para solicitar el cambio de
email vía `POST /users/change-email`.

## Specs

- S1: «Contrato: `POST /users/change-email` → 200. El cambio se completa confirmando
  desde el correo (U15).» → **Actualizado en L5** (A4 aterrizó como api-user #491/COU-263):
  el flujo real es de dos pasos: `POST /users/change-email/code` (código de 6 dígitos al
  email actual, TTL 10 min, 5 intentos, reenvío throttled 60 s) y luego
  `POST /users/change-email` con cuerpo **`{ email, code }`**.
- S2: «**Dependencia con A4**: hoy el endpoint acepta únicamente `{ email }`, sin
  contraseña actual, lo cual es un problema de seguridad. Cuando A4 agregue la
  confirmación de identidad, esta pantalla debe incorporar el campo correspondiente.»
  → **A4 ya aterrizó** (api-user #491, cerrado 2026-11-01): la confirmación de identidad
  es un código enviado al email actual; la pantalla incorpora el campo `code`.
- S3: «Sección dentro de `/profile`.»
- S4: «Solicitud de nuevo email con validación de formato.»
- S5: «Aviso de que el cambio debe confirmarse desde el correo.»
- S6: «**Fuera de alcance**: la confirmación con token (U15) y el endurecimiento del
  endpoint (A4).»
- S7: «`Card` con formulario y mensaje informativo del flujo de confirmación.»
- S8: i18n namespace `profile`: `profile.email.title`, `profile.email.fields.newEmail`,
  `profile.email.submit`, `profile.email.successPending`,
  `profile.email.errors.invalid`, `profile.email.errors.taken`.
- S9: criterios: «Valida el formato del email antes de enviar», «Informa que el cambio
  se confirma desde el correo», «Email ya en uso → error en el campo», «Test con MSW y
  test axe», «Claves presentes en los tres idiomas». → **Extendido en L5**: además
  valida que el email nuevo difiera del actual (400 UA-COM-005 mismo email), envía el
  código al email actual antes de enviar, exige el código, y mapea 401 UA-AUTH-010
  (código inválido/vencido) a error de campo en `code`.

## Tasks

- T1 (S1,S4,S9) `src/features/profile/api.ts`: `requestEmailChange` POST
  `/users/change-email` + test. ✔ commit: bae3415
- T2 (S8,S9) claves `profile.email.*` en `en.ts`/`es.ts`/`pt.ts` (paridad CI). ✔ commit: bae3415
- T3 (S3,S5,S7,S9) `email-change-card.tsx` + `email-change-errors.ts` +
  `useRequestEmailChange` + test integración MSW/axe (6/6). ✔ commit: bae3415
- T4 (S3) montar la Card como segunda sección en `profile-page.tsx` + handler MSW +
  aserción de página. ✔ commit: bae3415
- T5 (S1,S2,S9) `api.ts`: `requestEmailChangeCode` POST `/users/change-email/code` y
  `requestEmailChange(email, code)` con cuerpo `{email, code}` + tests. ✔ commit: bae3415
- T6 (S8,S9) claves nuevas `profile.email.fields.code`, `fields.codeHint`,
  `actions.sendCode/sendingCode/resendCode`, `codeSent`, `errors.sameEmail`,
  `errors.codeInvalid`, `errors.sendCodeFailure`. ✔ commit: bae3415
- T7 (S2,S4,S9) Card a dos pasos (enviar código → email + código), mapper ampliado
  (UA-COM-004→newEmail, UA-AUTH-010→code), mismo-email client-side + tests (8/8). ✔ commit: bae3415
- T8 (S3) `profile-page.tsx` pasa el email actual a la Card. ✔ commit: bae3415

Nota de slicing: el ciclo de corrección de contrato (L5) llegó con T1–T4 ya
  terminados; al reimplementar la Card para el flujo real el conjunto quedó en un
  solo commit de ~737 líneas porque reescribió los mismos archivos. El slice ya está
  entregado; el próximo trabajo (issue #116) abre feature document nueva.

## Log

- L1 (usuario): «usa la skill kickoff» → kickoff: issue #57 elegido con Estimate 2
  (board #6), status In Progress, rama `feature/57-solicitud-cambio-email` desde
  `origin/develop` (`--no-track`).
- L2 (usuario): «ok» → autorizada la implementación de #57.
- L3 verificación (Node 22 vía nvm): suite del feature + i18n 54/54, suite completa
  950/950, lint 0 errores, typecheck OK, build OK. En Node 26 local los tests de
  integración MSW fallan por incompatibilidad del interceptor (preexistente, verificado
  contra develop); los unit tests requieren `--localstorage-file`.
- L4 error de email tomado mapeado por código `UA-COM-004` (409) → error de campo
  `newEmail` (patrón de `users/create-user-errors.ts`).
- L5 (usuario, verbatim parcial): «Revisemos por favor la implementacion, porquer esta
  fallando realmeente? […] hay cierto proceso por el cual pasar para realizar un cambio
  de email […] se supone que hay un ticket ya finalizado en el board de api-user con
  todo esto» → el POST real devolvió 400 UA-COM-005 pidiendo `code`. Investigación del
  backend: A4 = api-user #491 (COU-263, cerrado): flujo de dos pasos
  (`change-email/code` + `change-email {email, code}`, luego `confirm-email-change`
  con token, ventana de reversión 72 h). Se reabren S1/S2/S9 y se agregan T5–T8.
- L6 verificación (Node 22): feature + paridad 43/43, suite completa 953/953 (exit 0),
  lint 0 errores, typecheck OK, build OK. Gotcha del flujo 401: el cliente reintenta
  via `/auth/refresh` antes de propagar el error (mockear refresh con 200 + tokens y
  contar 2 requests); un refresh 401 en el mock produce un deadlock real
  (refreshSession se auto-espera via `inFlight`).
- L7 (usuario): «sinceramente mejoraria el componente, quizas mostrar siempre el
  input de codigo pero disabled hasta que se envie el codigo y aumentaria el tamaño
  del boton de reenviar codigo» → campo `code` siempre visible (disabled hasta enviar
  el código, habilitado después) y botón enviar/reenviar código a `h-10 px-4`
  (altura del input). Tests ajustados (38/38 del feature, lint y typecheck OK).
- L8 alineación vertical del ícono en los Alerts de éxito/código enviado: fila flex
  `items-center` + `size-4` (el posicionamiento absoluto del Alert descentraba la
  descripción sola). Tests 8/8, typecheck OK.
- L9 (usuario): «ok vamos con esto» → commit autorizado: bae3415
  `feat(profile): add the two-step email change request section (#57)`
  (12 archivos, 734 inserciones). Issue #116 creado por el 404 del link de
  confirmación y la discrepancia de ruta (`/confirm-email` vs
  `/confirm-email-change`), board Todo, Estimate 2.
- L10 (usuario, verbatim): «si despues del commit y push aparecen hallazgos de reviews,
  se revisa que se corrige de todo lo que surja y lo corregimos aca, no en otra rama
  ni va a backlog ok?» → acuerdo: los hallazgos de review del PR #117 se corrigen en
  esta misma rama `feature/57-solicitud-cambio-email`; nada va a backlog ni a otra
  rama. PR #117 abierto a develop, board #57 In Review.
