# Restablecer contraseña (#61 / COU-283)

Feature: `POST /auth/reset-password` client flow at `/reset-password?token=...`.
Branch: `feature/61-restablecer-contrasena` (base `origin/develop`).

## Specs

- S1: Ruta `/reset-password?token=...`. "Contrato: `POST /auth/reset-password` con el token que llega en la URL."
- S2: "Formulario con contraseña nueva + confirmación." "Las dos contraseñas deben coincidir; si no, error en el campo de confirmación."
- S3: "La validación del cliente coincide con las reglas de `@PasswordStrength` del API." "Lista de requisitos de contraseña con estado cumplido/no cumplido."
- S4: "Estado dedicado para token inválido o expirado, con link para solicitar uno nuevo."
- S5: "Éxito → confirmación con CTA a login."
- S6: i18n namespace `auth`: `auth.reset.title`, `auth.reset.fields.password`, `auth.reset.fields.confirm`, `auth.reset.passwordRules.*`, `auth.reset.submit`, `auth.reset.success`, `auth.reset.errors.invalidToken`, `auth.reset.errors.expiredToken`, `auth.reset.errors.mismatch` — "Claves presentes en los tres idiomas" (es, en, pt).
- S7: "Test con MSW (éxito, token inválido) y test axe." Diseño: "`Card` centrada, `Form` + `Input` (con visibilidad de contraseña) + `Button`." Fuera de alcance: la solicitud del email (U13, issue #62 done).

## Tasks

- T1 (S1, S7): API mutation + `use-reset-password` hook en `src/features/auth/`.
- T2 (S2, S3): schema zod con reglas de contraseña + mismatch, con tests.
- T3 (S1, S3): página `reset-password-page.tsx` con Card/Form/Input(visibility)/Button y lista de requisitos.
- T4 (S4): estado token inválido/expirado con link a forgot-password.
- T5 (S5): estado éxito con CTA a login.
- T6 (S6): claves `auth.reset.*` en es, en, pt.
- T7 (S7): tests MSW (éxito, token inválido) + axe; route test.
- T8 (S1-S7): gate `make ci` (lint + typecheck + test:coverage + build) y preparación de commit para autorización.

## Log

- L1 (2026-11-11): "usa la skill kickoff". Bootstrap: issue #61 elegido por continuidad (#62 olvidé mi contraseña → Done, #61 es su parte 2). Estimate 3 (decisión del usuario), board In Progress, rama `feature/61-restablecer-contrasena` creada desde `origin/develop` sin upstream. Pendiente de viaje al repo: entradas L9-L11 de `odd/tasks/54-desbloqueo-de-cuentas.md` (el usuario decidió subirlas "en el próximo ticket").
- L2 (2026-11-11): Kickoff skill ejecutada contra board ui-user #6; issue listo (project, estimate 3, assignee leandrojaviercepeda).
- L3 (2026-11-11): Incidente de entorno diagnosticado por separado: Node 26 (local) rompe la suite de dos formas — (a) el `localStorage` nativo experimental le hace sombra al de jsdom en vitest (vitest#8757/#10867) y (b) MSW no intercepta fetch dentro de vitest (bloqueo documentado en bindery#1201). Mitigación: scripts de test con `NODE_OPTIONS=--no-experimental-webstorage` (a) y correr la suite con Node 22 (nvm v22.23.4, paridad de CI) para (b). Gate local completo con Node 22: lint exit 0, typecheck exit 0, 906/906 tests, cobertura 97.84%, build exit 0.
- L4 (2026-11-11): Implementación completa: `src/lib/password-rules.ts` (reglas extraídas, `create-schema.ts` reutiliza), API `resetPassword` + `use-reset-password`, schema zod con mensajes por regla, página con checklist, estados éxito/token inválido, ruta `/reset-password`, i18n `reset.*` en es/en/pt, 19 tests nuevos (MSW + axe + schema + reglas). Pendiente: autorización de commit.
- L5 (2026-11-11): Reporte del usuario: 500 `UA-COM-001` "Illegal arguments: undefined, string" al probar el flujo real. Causa raíz verificada en `api-user/src/auth/auth.controller.ts:91`: el API espera `{ token, newPassword }`; el cliente enviaba `{ token, password }` y el hasher recibía `undefined`. Corregido en `api.ts`, `use-reset-password.ts`, página y aserción del test de integración. Suite auth 107/107, lint y typecheck en verde.
- L6 (2026-11-11): El usuario verificó el flujo real end-to-end: "quedo funcional todo". Commits autorizados: `bd8c618` docs(odd), `4413a68` refactor(lib), `7b8a0d8` feat(auth). Push a `origin/feature/61-restablecer-contrasena`, PR #112 abierto a `develop` (Closes #61), board #61 → `In Review`.
- L7 (2026-11-11): Commit autorizado `15b36f5` docs(odd): log the password reset delivery (el cierre del #54 viajó en este PR). Review nativa RDD sobre el candidato completo: lineage `review-9b2560ebdd4f1c79`, tier high (auth hot path), lentes risk+reliability, 2 revisores — APROBADA, 0 correcciones, autoridad quemada con recibo.
- L8 (2026-11-11): Disposición de los 4 hallazgos informativos (decisión del usuario: corregirlos): R1-dead-expired-branch + R3-001 → el ternario del copy expiredToken era inalcanzable (el API manda inválido/expirado como un solo código); corregido a mensaje único, clave `expiredToken` queda definida en los 3 locales para un futuro código distinto. R3-002 → eliminado el re-export de `passwordStrength` en `create-schema.ts`; consumers importan de `@/lib/password-rules`. R3-003 → `passwordRuleEntries` es la única fuente (literal `{ id, check }`) y `passwordRuleChecks` deriva de ahí; sin emparejamiento por índice. Gate: lint/typecheck/build exit 0, 523/523 tests (lib+users+auth). Commit pendiente de autorización.
