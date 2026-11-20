# 136 — Corregir el cambio de tamaño de página en los listados

Issue countergank/ui-user#136 · branch `feature/136-corregir-tamano-pagina` (base `origin/develop`).

## Specs

- S1: "[ ] `parseListParams` lee y valida `limit` de la URL (entero ≥ 1; valor inválido o ausente cae al default de la config)."
- S2: "[ ] Elegir un tamaño de página dispara el request con el nuevo `limit` (assert sobre el request saliente, no solo la URL)."
- S3: "[ ] El selector muestra el límite activo tras el cambio."
- S4: "[ ] `email-templates` mantiene su comportamiento (check diferencial: mismo request saliente que antes del fix)."
- S5: "[ ] Un `limit` inválido en la URL manual (ej. `limit=abc`) no rompe la pantalla."

Contexto del issue (verbatim): "Cambiar la cantidad de elementos por página en el listado de usuarios (`/app/users`) no efectúa el cambio: el request sale con el límite anterior y el selector vuelve al valor por defecto." Causa raíz: `parseListParams` (`src/components/data-list/params.ts:70`) devuelve siempre `config.limit` sin leer la URL.

## Tasks

- T1 (S1, S2, S3, S5) — Fix en `parseListParams` (`parseLimit` con validación de entero seguro ≥ 1) + tests de request saliente y límite inválido. `src/components/data-list/params.ts`, `params.test.ts`, `users-page.integration.test.tsx`. commit: 7271d6f
- T2 (S4) — Check diferencial de `email-templates` contra el código base: 11 casos de URL comparados entre base (`origin/develop`) y fix; solo difieren los 3 casos que #136 pide (URL con `limit` válido → request con ese `limit`); detectó y corrigió el truncado de `limit=2.5`→2. commit: 7271d6f

## Log

- L1: "tambien pasa que al cambiar la cantidad de elementos por pagina, no funciona el cambio, es decir n ocarga la cantidad correspondiente" — reporte del bug; diagnóstico confirmado por lectura de código antes del fix.
- L2: "ok vamos pero creemos los tickets para corregir esto que falta entonces, usa github-skills; lo de metrics, fijate si ya tiene ticket" — autoriza commit de #128 + creación del issue (metrics ya tenía ticket: #122).
- L3: Fix implementado con TDD (RED→GREEN). El check diferencial contra el código base detectó que `parseInt` truncaba `limit=2.5`→2; corregido a `Number` + `Number.isSafeInteger`. El test unitario `params — parse > ignores parameters the list does not declare` usaba `limit=5000` como parámetro "no declarado" — codificaba el bug; actualizado. Gate en verde: lint ✓, typecheck ✓, 1017 tests ✓, build ✓.
- L4: Review nativo (lineage `review-2704cf0a2361dcc2`, lens reliability) aprobado con 4 hallazgos advisory. El humano pidió corregir los que correspondan antes del push. Corregidos los 4: `MAX_LIMIT=100` (tope real de ambos backends: `PaginationQueryDTO` y `CollectionPaginationQueryDTO`), forma decimal estricta `/^\d+$/`, assert exacto del texto del selector, y tests commiteados de email-templates para limit desde URL y fallback fuera de rango. Gate re-verificado: lint ✓, typecheck ✓, 1021 tests ✓, build ✓.
