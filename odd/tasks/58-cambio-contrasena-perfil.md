# 58-cambio-contrasena-perfil — Sección de cambio de contraseña en Mi perfil

Implementa #58 (COU-286): sección dentro de `/profile` para cambiar la contraseña
vía `POST /users/change-password`. Es la sección que el ODD de #59 dejó fuera de
alcance («cambio de contraseña (U17) y de email (U18)»); el U18 fue #57.

## Specs

- S1: «Contrato: `POST /users/change-password` → 200. Requiere contraseña actual y
  contraseña nueva.»
- S2: «Sección dentro de `/profile`.»
- S3: «Campos: contraseña actual, nueva, confirmación.»
- S4: «Manejo del error de contraseña actual incorrecta.»
- S5: «`Card` separada con su propio formulario y `Button`.»
- S6: «`Input` con visibilidad de contraseña.» (usar `PasswordInput` existente)
- S7: «Lista de requisitos con estado cumplido/no cumplido.» (usar
  `passwordRules` + patrón `PasswordChecklist` de reset-password-page)
- S8: i18n namespace `profile`: `profile.password.title`, `profile.password.fields.current`,
  `profile.password.fields.new`, `profile.password.fields.confirm`,
  `profile.password.submit`, `profile.password.success`,
  `profile.password.errors.currentIncorrect`, `profile.password.errors.mismatch`.
- S9: criterios: «La validación coincide con las reglas del API» (las reglas de
  `src/lib/password-rules.ts`, 8-64 chars, mayúscula, minúscula, dígito, especial,
  sin repetidos/secuencias comunes — el backend valida lo mismo),
  «Contraseña actual incorrecta → mensaje en **ese** campo» (código de error del
  backend a confirmar en el worker: mapear el código real de 400/401 de
  contraseña actual incorrecta al campo `current`),
  «Las contraseñas nuevas deben coincidir», «Éxito → toast y limpieza del
  formulario», «Test con MSW (éxito, actual incorrecta) y test axe»,
  «Claves presentes en los tres idiomas».

## Tasks

- T1 (S1) `src/features/profile/api.ts`: `changePassword(currentPassword, newPassword)`
  POST `/users/change-password` + test en `api.test.ts`. ✔
- T2 (S8,S9) claves `profile.password.*` en `en.ts`/`es.ts`/`pt.ts` (paridad). ✔
- T3 (S2–S7,S9) `password-change-card.tsx` (tercera Card en `/profile`, bajo la de
  email): RHF + zod (current requerido, new con `passwordRules`, confirm con
  mismatch), `PasswordInput`, checklist de requisitos, error de campo en actual
  incorrecta, toast + reset al éxito + tests MSW/axe. ✔
- T4 (S2) montar la Card en `profile-page.tsx` bajo `EmailChangeCard`. ✔

## Log

- L1 (usuario): «en esta sesion solamente trabajamos en tickets de ui-user, mergeado
  eel pr, vamos con kickoff nuevamente» → #118 cerrado (PR #120 mergeado, board
  Done). Kickoff: #58 por continuidad con Mi perfil (#57/#111/#113); Estimate 3,
  board In Progress, rama `feature/58-cambio-contrasena-perfil` desde
  `origin/develop` actualizado (`--no-track`). Restricción de sesión: solo
  tickets de ui-user (api-user #554 queda fuera de esta sesión).
