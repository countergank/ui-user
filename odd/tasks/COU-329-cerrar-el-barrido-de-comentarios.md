# COU-329 — Cerrar el barrido de comentarios

Linear: https://linear.app/countergank/issue/COU-329/cerrar-el-barrido-de-comentarios-110-lineas-que-quedaron-en-44
Branch: `feature/cou-329-cerrar-el-barrido-de-comentarios-110-lineas-que-quedaron-en` (desde `develop` @ `9afc2b5`)

## Specs

**S1** — Regla vigente: cero comentarios; sólo JSDoc de API con `@param`/`@returns` sobre un export,
y directivas (`biome-ignore`, `eslint-disable`, `/// <reference>`) con su justificación.

**S2** — Verificación por **estado final**: el escaneo cuenta lo que queda en el árbol, no lo que el
diff borró. COU-328 falló justamente por verificar el diff.

**S3** — AC: cero líneas de prosa; cero JSDoc que no documente una API exportada; `make ci` verde;
diff sólo de comentarios.

## Tasks

| ID | Task | Specs | Commit |
|---|---|---|---|
| T1 | Quitar las 110 líneas de prosa en 44 archivos | S1 | — |
| T2 | Escaneo final: 0 prosa + 32 JSDoc, todos API | S2, S3 | — |
| T3 | Restaurar la directiva `/// <reference>` que el script borró | S1 | — |
| T4 | `make ci` | S3 | — |

## Log

**L1 — Origen**, verbatim: "mergeado" → al verificar el estado final aparecieron 110 líneas de prosa
en 44 archivos que COU-328 no barrió (headers de tests, `main.tsx`, `public-layout.test.tsx`).

**L2 — Error propio, registrado**: mi verificación de COU-328 comparó el **diff** ("¿lo borrado era
comentario?") en vez del **estado final** ("¿quedan comentarios?"). Ese es el motivo de la brecha.

**L3 — Segundo error propio, atajado por el gate**: el script de barrido borró
`/// <reference types="vite/client" />`, que para `tsc` es código. Sin ella `import.meta.env` quedó
sin tipos y `env.ts` falló. Se restauró y `AGENTS.md` ahora habla de "instrucciones al toolchain",
nombrando también las directivas de compilador.
