# 54-desbloqueo-de-cuentas

Feature: Construir el desbloqueo de cuentas (issue #54, branch `feature/54-desbloqueo-de-cuentas`).
Contract: `PATCH /admin/users/:id/unlock` → `{ message, userId }`.

## Specs

- S1: Llamar `PATCH /admin/users/:id/unlock` → `{ message, userId }` (contrato del API).
- S2: Acción de desbloqueo disponible desde el listado y desde el detalle, con confirmación previa (`AlertDialog`).
- S3: Mostrar `lockedUntil` y `failedLoginAttempts` cuando A2 esté disponible (indicador de bloqueo en fila/detalle).
- S4: Acción visible solo con el permiso `user:unlock`.
- S5: Toast con el `message` traducido que devuelve el API.
- S6: Test con MSW y test axe.
- S7: Claves i18n presentes en los tres idiomas, namespace `users`: `users.unlock.action`, `users.unlock.confirmTitle`, `users.unlock.confirmBody`, `users.unlock.success`, `users.unlock.lockedSince`, `users.unlock.attempts`.
- S8: Cumple CV1–CV10 (convenciones del repo). Depende de U06, U07, U09, U10 y A2.

## Tasks

- T1 [S1] — función de cliente HTTP para `PATCH /admin/users/:id/unlock` — DONE en `f71d609` — DONE: `unlockUser` + `unlockUserResponseSchema` + `useUnlockUser` (invalida listado y detalle), test `use-unlock-user.integration.test.tsx` 5/5. Incidente resuelto: entorno corriendo Node 26; `.nvmrc` pide 22 — con Node 22 todo el suite pasa sin cambios de repo.
- T2 [S2, S4, S5] — acción en el listado — DONE en `f71d609` — DONE: `PERMISSIONS.userUnlock`, botón habilitado dentro de `<Can user:unlock>` (solo filas bloqueadas), `UnlockConfirmDialog` (toast con `message` del API, fallback `unlock.success`), cableado en `users-page.tsx`. Test de diálogo 6/6 con axe.
- T3 [S2, S4, S5] — acción en el detalle — DONE en `f71d609` — DONE: `admin-actions-card.tsx` quita `unlock` de los placeholders y lo hace acción viva (solo `isLocked`), diálogo compartido; hook invalida `userQueryKey` para refrescar el detalle. Tests de página de detalle: flujo completo + caso sin bloqueo.
- T4 [S3] — indicador de bloqueo — DONE en `f71d609` — DONE: el detalle ya mostraba `lockedUntil`/`failedLoginAttempts` (sessions-card); el listado suma `title` en la celda de estado con `unlock.lockedSince` + fecha y `unlock.attempts` + cantidad (test RED→GREEN).
- T5 [S7] — claves i18n `users.unlock.*` — DONE en `f71d609` — DONE: 6 claves en en/es/pt, paridad verificada.
- T6 [S6] — tests MSW + axe — DONE en `f71d609` — DONE: cubiertos por los tests nuevos (hook, diálogo con axe, página listado, página detalle) + suite completo 885/885, cobertura 97.8%, `pnpm build` OK, lint y typecheck limpios.

## Log

- L1 (2026-11-10): «Creemos el indice de codegraph para el repo actual, luego quiero que uses la skill kickoff» → kickoff seleccionó #54 (continuidad con #106), Estimate 3, assignee leandrojaviercepeda, board In Progress, branch `feature/54-desbloqueo-de-cuentas` desde `origin/develop` @ `6c120f7`.
- L2 (2026-11-10): Incidente de entorno: el suite completo fallaba (zustand/localStorage y MSW/AbortSignal). Causa raíz: Node 26.13.0 en vez del Node 22 que fija `.nvmrc` — Node 25+ rompe jsdom localStorage (vitest#8757) y la interceptación MSW (mswjs/msw#2530). Resolución: `nvm install 22` y correr todo con Node 22; `package.json` y lockfile quedaron sin cambios.
- L3 (2026-11-10): Implementación completa T1–T6; gate local `make ci` equivalente en verde (885 tests, cobertura 97.8%, build OK).
- L4 (2026-11-10): Commit autorizado en sesión: `f71d609` `feat(users): add the account unlock action in the admin list and detail` (16 archivos, +728/-17, código + doc ODD). Slice único de 745 líneas — primer work-unit del feature.
- L5 (2026-11-10): Push + PR abierto: [#110](https://github.com/countergank/ui-user/pull/110) → `develop` con `Closes #54`. Board #54 movido a `In Review` (verificado). CI: `quality-gates` falló por formateo Biome en 5 archivos + 2 errores ESLint reales (cast innecesario y número en template literal en `users-columns.tsx`).
- L6 (2026-11-10): Corrección verificada por exit codes (lección: el grep del lint se traga los errores de formato): lint/typecheck/build exit 0, suite 885/885, cobertura 97.8%. Commit autorizado `9194f22` `fix(users): correct formatting and eslint errors from the unlock feature` y push. CI run 2: `quality-gates` volvió a fallar — flake preexistente (#44): `ReferenceError: window is not defined` post-teardown originado en `src/main.test.tsx` (callback de React pendiente tras el `setTimeout(0)`).
- L7 (2026-11-10): Flake corregido de raíz: el test drena el trabajo de React con `await act(async () => { await Promise.resolve(); })` en vez del timeout ciego. 4 corridas consecutivas limpias + gate completo en exit 0. Commit autorizado `cf2c949` `fix(test): drain pending react work in main entry test to stop teardown flake` y push. Esperando CI run 3.
