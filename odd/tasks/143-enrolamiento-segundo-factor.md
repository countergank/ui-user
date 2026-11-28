# 143 — Construir el enrolamiento del segundo factor con QR en la consola

Feature: pantalla de enrolamiento TOTP en el perfil del usuario autenticado, consumiendo
`POST /auth/2fa/enroll` y `POST /auth/2fa/activate` de api-user #566. Issue:
countergank/ui-user#143. Branch: `feature/143-enrolamiento-segundo-factor` (base `origin/develop`).

## Specs

- S1: "Desde el perfil, el usuario puede iniciar el enrolamiento y la pantalla renderiza el QR a partir de `otpauthUrl`."
- S2: "El secreto base32 se muestra como alternativa manual con copiado al portapapeles, y la pantalla advierte que no se volverá a mostrar."
- S3: "Un input de 6 dígitos confirma contra `POST /auth/2fa/activate`; código correcto → estado "segundo factor activado"."
- S4: "Los errores del API (UA-AUTH-012 sin enrolamiento pendiente, UA-AUTH-013 código inválido, budget agotado) se muestran con copy i18n siguiendo el mapeo existente de errores UA-*."
- S5: "Al agotarse el budget de intentos, la pantalla ofrece volver a enrolar (nuevo secreto)."
- S6: "Tests de componente del ciclo completo con el API mockeado."

Non-goals (del issue): paso de código en el login (#144, api-user #567); códigos de recuperación (#145, api-user #568); baja del segundo factor (#147, api-user #570).

## Tasks

- T1 · S1 · Contrato: leer endpoints 2FA de api-user (#566) y definir api client + tipos · commit —
- T2 · S1 · Pantalla de enrolamiento con QR renderizado desde `otpauthUrl` · commit —
- T3 · S2 · Secret base32 como alternativa manual con copiado y warning de única vez · commit —
- T4 · S3 · Input de 6 dígitos + activación contra `POST /auth/2fa/activate` · commit —
- T5 · S4 · Errores UA-AUTH-012 / UA-AUTH-013 / budget agotado con copy i18n UA-* · commit —
- T6 · S5 · Re-enrolamiento (nuevo secreto) al agotarse el budget de intentos · commit —
- T7 · S6 · Tests del ciclo completo con API mockeado · commit —
- T8 · S1 · Wiring: entrada al enrolamiento desde el perfil · commit —

Entrega como commit único: la card, su api, sus hooks, el catálogo de errores y los tres locales se intercalan (los tests de integración ejercen el ciclo completo junto), por lo que partir por tarea exigiría staging parcial artificial. Slice boundary registrado aquí. La dep react-qr-code ^2.2.0 y su ADR-14 (docs/adr.md) viajan en el mismo commit, decisión del usuario registrada en L4.

## Log

- L1: "Perfecto! vamos con kickoff entonces"
- L2: Kickoff de #143. Elección por unblocking: es el primer eslabón de la saga 2FA (#143–#147); sin enrolamiento no hay 2FA activo y los otros cuatro issues presuponen usuarios enrolados. Decisión del usuario: issue #143, Estimate 5. Board: In Progress (aplicado via mutation directa; la lista del project sirve datos con delay — verificado leyendo el node del item). Rama `feature/143-enrolamiento-segundo-factor` creada `--no-track` desde `origin/develop`, árbol limpio. Nota operativa: el ITEM_ID del board cambió respecto de la query inicial de la sesión (PVTI_…zhMMU6s); los primeros item-edit fueron a un id viejo sin efecto.
- L3: Mapa de exploración (gentle-ai-explore): perfil — `profile-page.tsx:17-63` con grilla de 2 columnas, columna derecha con EmailChangeCard + PasswordChangeCard (la card de seguridad/2FA va ahí), ruta `/profile` en `routes/index.tsx:83-85` sin sub-rutas; API — patrón feature `features/profile/api.ts` + `hooks/use-profile.ts` con zod y AppError UA-*; errores — catálogo `errors/catalog.ts:1-35` (UA-AUTH-012/013 NO existen aún, hay que extender), resolución `errors/resolve.ts:38-72` vía `error.ua.*`, niveles 400/409/422→form; QR — no hay librería QR en el repo, nueva dep runtime requiere ADR (ADR-2 es el precedente de stack); sesión — `SessionUser` sin `twoFactorEnabled` (schema zod + persist v1, agregar campo implica migración), `/auth/me` no lo devuelve aún (viene con #147/api-user #570); clipboard — único precedente `error-view.tsx`; input 6 dígitos — precedente `email-change-card.tsx:166-175` (`inputMode=numeric`, `one-time-code`, `maxLength=6`, zod `/^\d{6}$/`); tests — api unit con spy de httpClient (`profile/api.test.ts:14-16`), integración MSW base `https://test.invalid`, paridad i18n forzada por `lib/i18n/parity.test.ts` (en es referencia). Contrato api-user #566 confirmado: `POST /auth/2fa/enroll` → `{secret, otpauthUrl}` (secret se muestra una vez, re-enroll reemplaza el pendiente); `POST /auth/2fa/activate` body `{code}` `/^\d{6}$/` → 200 `{twoFactorEnabled: true}`; UA-AUTH-012 (sin enrolamiento, 400), UA-AUTH-013 (código inválido, 401), budget 5 intentos y al agotarse purga el enrolamiento (siguiente intento → UA-AUTH-012).
- L4: Decisión de stack del usuario: "react-qr-code (recomendada)" — dep `react-qr-code ^2.2.0` instalada y ADR-14 agregado a `docs/adr.md` (Contexto → Decisión → Consecuencias; qrcode.react y qrcode rechazadas con motivo).
- L5: Implementación completa (gentle-ai-worker, backstop de contexto) con TDD: RED 7 tests fallando (api ×6 + componente inexistente + wiring) → GREEN. Archivos: `two-factor-card.tsx` (nueva, máquina de estados idle→pending→activated/expired), `api.ts` (+`enrollTwoFactor`/`activateTwoFactor` con zod y guard client-side), `hooks/use-profile.ts` (+2 mutaciones), `catalog.ts` (+UA-AUTH-012/013), locales es/en/pt (+`error.ua` ×2 y `profile.twoFactor.*`), `profile-page.tsx` (card tercera en columna derecha), tests: `api.test.ts` +6, `two-factor-card.integration.test.tsx` (nueva, 9 MSW+axe), `profile-page.integration.test.tsx` (+1 wiring). Verificación: 70/70 tests del perfil + paridad (propia del parent); worker: lint ✓ typecheck ✓ 65/65 profile + parity 5/5 + errors 142/142. El estado "activado" es component-local (sin `twoFactorEnabled` en `SessionUser` hasta #147 — non-goal del issue). UA-AUTH-013 es 401: el httpClient hace su refresh+retry estándar antes de surfazarlo (mockeado en tests).
- L6: Verificación final: `pnpm lint` ✓ (373 archivos) · `pnpm typecheck` ✓ · `pnpm test:coverage` 1120/1120 (123 archivos) · coverage 97.84% líneas / 93.75% branches / 93.59% funciones (floor 80) · `pnpm build` ✓. Commit pendiente de autorización del usuario.
- L7: Iteración de UX del usuario (post-verificación): "mejoremos la disposicion deel componente de 2fa" → "Y PORQUE NO UN STEP COMO LO SUELEN HACER LA MAYORIA DE LASS PAGINAS?" → wizard de pasos: stepper con indicador de progreso (círculos numerados, aria-current, ✓ en paso completado), Paso 1 escaneá (QR + secret + copiado + warning) → Continuar → Paso 2 confirmá (input OTP centrado) → Volver/Confirmar código; Volver conserva el enrolamiento sin re-pedir secret (testeado); axe sin violaciones en ambos pasos.
- L8: Iteración de UX del usuario, verbatim: "DALE SI, VAMOS ASI y pasamos el componetne a la izquierda debajo de Datos personales y en un card mas grande, con el codigo QR centrado al medio y debajo el resto de componentes peero todo dentro de un mismo card" → card movido a la columna izquierda debajo de Datos personales (mismo stack, testeado), full-width de la columna, QR 184px centrado, resto apilado debajo en bloque max-w-md centrado, paso confirm también centrado.
- L9: Iteración de UX del usuario, verbatim: "saquemos este componente: Autenticación de dos factores Protegé tu cuenta… y vamos de primera ya con el QR" → estado idle eliminado: el card auto-enrola al montar (effect con guard useReff una única vez), muestra "Configurando…" mientras viaja y el QR aparece directo; descripción del card eliminada de es/en/pt; botón Reintentar si el enroll falla (testeado con recovery); handler de enroll mockeado en el test de la página. Verificación tras las tres iteraciones: lint ✓ typecheck ✓ 70/70 (perfil + paridad i18n).
- L10: Autorización del usuario, verbatim: "Excelente! ya podemos proceder a commitear push y pr". Mensaje: `feat(profile): enroll second factor with qr code`.
- L11: Entrega: commit `4b81bf6` (15 archivos, +1123/−32, slice único) pusheado a `feature/143-enrolamiento-segundo-factor`. Gate final previo: lint ✓ · typecheck ✓ · 1120/1120 tests · coverage 97.85%/93.73% · build ✓. PR #149 abierto contra develop (Refs #143, template completo con ADR-14 mencionada); board movido a In Review y verificado leyendo el node (Estimate 5). Pendiente: CI de GitHub y review humana; el merge usa el bypass documentado si corresponde, mismo patrón que #53/PR #148.

