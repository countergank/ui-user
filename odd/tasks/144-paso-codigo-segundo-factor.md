# Feature: Paso de código del segundo factor en el login (#144)

Branch: `feature/144-paso-codigo-segundo-factor` (base `origin/develop`)
Estimate: 3 · Assignee: leandrojaviercepeda · Board: In Progress (Project #6)

## Specs

S1. El login detecta la respuesta de challenge pendiente y navega a la pantalla de código sin guardar sesión parcial.
S2. El usuario sin 2FA activo sigue entrando directo (compatibilidad total con el flujo actual).
S3. El código se envía a `POST /auth/2fa/challenge`; éxito → sesión normal (tokens, redirect igual que hoy).
S4. Código inválido → mensaje con el copy de UA-AUTH-013 y el input habilitado para reintentar.
S5. Challenge expirado o budget agotado → vuelta al login con mensaje que pide re-autenticarse.
S6. Tests de componente de los tres caminos: sin 2FA, challenge exitoso, challenge fallido.

Contract (api-user #567, implemented and merged):
- `POST /auth/login` + contraseña válida + `twoFactorEnabled` → `{ twoFactorRequired: true, challengeToken: string }`, sin tokens, sin sesión registrada.
- `POST /auth/login` sin 2FA → `AuthResponse` actual (accessToken/refreshToken/user/sessionId), byte-idéntico.
- `POST /auth/2fa/challenge` body `{ challengeToken, code }` (6 dígitos) → `AuthResponse`.
- Código inválido → `UA-AUTH-013` 401, budget de 5 intentos decreciente.
- Token expirado/desconocido o budget agotado → `UA-AUTH-014` 401, challenge muerto, re-autenticar con contraseña.
- Throttle propio del endpoint: 10 req / 60 s.

## Tasks

| ID | Specs | Route | Commit |
|---|---|---|---|
| T1 | S1, S2 | inline: API layer — discriminated login response union + `verifyTwoFactorChallenge` in `src/features/auth/api.ts`; UA-AUTH-014 in error catalog | bafb762 |
| T2 | S1, S3 | inline: hooks — `useLogin` branches pending challenge without `startSession`; new challenge verify hook starting session | bafb762 |
| T3 | S1, S3, S5 | inline: UI — challenge screen (`/login` sub-route or state), code form, navigation preserving redirect target, re-auth message on UA-AUTH-014 | bafb762 |
| T4 | S1-S5 | inline: i18n keys en/es/pt (parity) | bafb762 |
| T5 | S6 | inline: component tests — three paths (no 2FA direct, challenge success, challenge failure incl. UA-AUTH-013 retry and UA-AUTH-014 back to login) | bafb762 |

## Log

L1 (2026-11-28): «Usa la skill kickoff» → kickoff completado: issue #144 elegido por continuidad con #143 (serie 2FA) y por desbloquear #146; board In Progress; rama `feature/144-paso-codigo-segundo-factor` desde `origin/develop` `--no-track`.
L2 (2026-11-28): «vamos» — autoriza la implementación. Exploración delegada (gentle-ai-explore): mapa del login flow, patrón two-factor-card de #143, i18n error mapping, rutas y convención de tests. Contrato extraído de api-user #567 (DTOs + ODD 567): challengeToken base64url TTL 5 min, budget 5, UA-AUTH-013 código inválido, UA-AUTH-014 challenge muerto.
L3 (2026-11-28): implementación inline T1-T5. Diseño: el challenge vive como estado interno de `LoginPage` (contraseña → challenge → sesión), challengeToken solo en memoria de React, nunca en storage ni URL; el destino del redirect se resuelve una vez en el submit de la contraseña y viaja como prop. Archivos: `api.ts` (unión `LoginResponse` + type guard `isTwoFactorChallenge` + `verifyTwoFactorChallenge` con pre-validación de 6 dígitos), `hooks/use-login.ts` (branch sin `startSession` en challenge), `hooks/use-verify-two-factor-challenge.ts`, `two-factor-challenge-schema.ts`, `two-factor-challenge-form.tsx`, `login-form.tsx` (prop `onTwoFactorChallenge`), `login-page.tsx` (máquina de estados), `catalog.ts` (+UA-AUTH-014), locales en/es/pt (+`challenge.*` y UA-AUTH-014). Tests: +4 en `login-form.test.tsx`/`login-page.integration.test.tsx` (challenge sin sesión parcial, éxito vía challenge, UA-AUTH-013 reintento, UA-AUTH-014 vuelta al login), fix de prop en `login-redirect.test.tsx`. Gate: lint ✅ · typecheck ✅ · 1130/1130 tests ✅ · build ✅. Sin commit: pendiente de autorización humana.
L4 (2026-11-28): reporte del usuario — bajo `lg` el panel de marca no renderiza y el contenido izquierdo del login quedaba pegado a la izquierda (preexistente, no introducido por este feature). Fix en `login-page.tsx`: primera versión centraba la columna entera (header y footer incluidos); corrección del usuario — solo el bloque central (título + subtítulo + form) se centra (`mx-auto w-full max-w-[460px]`, `lg:mx-0 lg:max-w-none`), header y footer conservan su posicionamiento original. Solo clases: verificación estructural + 17/17 tests del login.
L5 (2026-11-28): commit autorizado por el usuario: `bafb762` `feat(auth): add the two-factor code step to the login flow` (15 archivos, +459/-16). Tareas T1-T5 registradas con el hash.
L6 (2026-11-28): reporte del usuario — el perfil sigue ofreciendo enrolar 2FA a un usuario ya activo. Diagnóstico: `TwoFactorCard` (#143) auto-arranca `/auth/2fa/enroll` en el mount y no consulta estado; el backend (api-user, `TwoFactorService.enroll`) además pisa `twoFactorEnabled: false` incondicionalmente — cada visita al perfil desactiva el 2FA server-side. Decisión del usuario: levantar tickets nuevos en ambos repos para encaran el fix cuando el backend esté. Creados: api-user #574 (guard del enrolamiento) y ui-user #150 (espejo, auto-enrolamiento + estado), ambos en board con Estimate 2 y assignee, enlazados con #570/#147. Nada implementado en este repo para ese bug: queda fuera del alcance de #144.
