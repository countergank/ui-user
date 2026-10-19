# COU-310 — Home informativa pública

Linear: https://linear.app/countergank/issue/COU-310/construir-la-home-informativa-publica
Branch: `feat/COU-310-home-informativa-publica` (cut from `develop` @ `3f549a0`)
Feature identity: `COU-310-home-informativa` (stable)

## Specs

**S1 — Scope**, verbatim: "Incluye: nueva landing pública en `/` con qué es el proyecto, el
servicio que brinda, features, quickstart (`docker compose up`), stack y links a
repositorio/docs/licencia; layout público propio sin el shell de consola; copy en i18n con paridad
`en|es|pt`; actualización de `/about` para describir el proyecto."

**S2 — Non-goal**, verbatim: "Fuera: prerender/SSR y SEO, blog, analytics, CMS, y cualquier dato en
vivo de la API."

**S3 — AC1**, verbatim: "`/` se renderiza fuera del shell de consola (sin nav de consola ni su skip
link), con su propio `<main>` y un único `h1`."

**S4 — AC2**, verbatim: "El contenido cubre: qué es el proyecto, el servicio que provee, features,
quickstart con `docker compose up`, stack y links a repositorio, docs y licencia."

**S5 — AC3**, verbatim: "Todas las cadenas salen de i18n con paridad `en|es|pt`; el test de paridad
cubre el namespace nuevo."

**S6 — AC4**, verbatim: "`/about` sigue pública y describe el proyecto, no el template."

**S7 — AC5**, verbatim: "Ninguna superficie pública dispara requests a la API (test que falla si la
landing hace fetch)."

**S8 — AC6**, verbatim: "axe sin violaciones y sin estilos inline de diseño."

**S9 — ADR-13** (`docs/adr.md`), la decisión que este ticket implementa: superficies públicas
(`/`, `/about`, `/login`) sin el shell de consola; la consola vive en `/app/*` (COU-278).

## Tasks

| ID | Task | Specs | Route | Commit |
|---|---|---|---|---|
| T1 | `PublicLayout` (header, nav, skip link, announcer, main, footer) + split de rutas para `/` y `/about` | S1, S3, S8 | inline | T1 |
| T2 | Landing informativa: hero, qué es, servicio, features, quickstart, stack, links | S1, S4 | inline | T2 |
| T3 | `/about` reescrita para describir el proyecto | S1, S6 | inline | T3 |
| T4 | Retirar la home del template y probar que lo público no llama a la API | S2, S7 | inline | T4 |
| T5 | Adaptar la suite e2e a la superficie pública | S3, S8 | inline | T5 |
| T6 | Gate completo + docs | all | inline | T6 |

## Decisions

- **La home del template se retira, `/about` se conserva.** ADR-13 lista `/about` como superficie
  pública permanente; el hero/features/env-badge eran demo del molde y no describen al producto.
- **`LoginPage` no se envuelve en `PublicLayout`.** Ya es una superficie pública con su propio
  `<main>` y su card centrada (COU-281); meterle header y footer de sitio cambiaría una pantalla
  aprobada sin que el ticket lo pida.
- **`AppShell` queda sin ruta por un rato.** Deja de montarse en `/` y lo retoma COU-278 bajo
  `/app/*`. Sus tests siguen corriendo; se documenta para que no parezca código muerto.
- **Namespace i18n propio (`landing`)**, como `auth`: el test de paridad cubre cualquier namespace
  declarado, así que sumar claves nuevas no requiere tocar el test.

## Verification

`pnpm vitest run`, `pnpm lint`, `pnpm typecheck`, `pnpm test:coverage`, `pnpm build`, `pnpm test:e2e`.

## Progress

- [x] T1 — `PublicLayout` + split de rutas — `73d8dbd`. RED primero (el layout y el módulo de
  ruta no existían y el test de rutas afirmaba el shell). 5/5 del layout y el test de bootstrap
  actualizado: `/` ya no es la home del template.
- [x] T2 — Contenido de la landing — `030ff79`. Qué es, servicio, cuatro features, quickstart con
  el comando renderizado literal y stack; footer con repositorio, docs y licencia. Paridad
  `en|es|pt` del namespace `landing` desde el primer commit.
- [x] T3 — `/about` del proyecto — `a9c6d00`. La página describe el proyecto y dónde viven sus
  estándares; el copy muerto de `common.about` se eliminó de los tres bundles.
- [x] T4 — Retirar la home del template — `fc01ae1`. Se borran `src/features/home/**`,
  `home-route.tsx`, sus tests y el copy de `common.home`; `public-surface.test.tsx` maneja el
  router real y prueba que `/` y `/about` no hacen ni una request.
- [x] T5 — e2e — `02ea1f9`. 6/6 en Chromium contra el build de producción. El primer intento falló
  en el journey de teclado porque el link de marca del header público agrega un Tab stop que el
  shell no tenía; el test ahora recorre el orden real.
- [x] T6 — Gate y docs. `make ci` exit 0 (lint, typecheck, coverage, build) y `pnpm test:e2e` 6/6.
  `folder-structure.md`, `component-patterns.md`, `error-handling.md` y el ejemplo de ADR-1
  apuntaban a `src/features/home`; los cuatro se reescribieron contra código vivo. `/` se sirve
  como chunk propio (`landing-route`, 2.39 kB).

## Findings

1. **La home del template era el ejemplo de tres documentos de estándares.** Borrarla dejaba
   `folder-structure.md`, `component-patterns.md`, `error-handling.md` y un ejemplo de ADR-1
   apuntando a archivos inexistentes. Se reescribieron con código real en el mismo ticket en vez
   de dejar la deuda.
2. **`AppShell` queda sin ruta.** Deja de montarse en `/` y lo retoma COU-278 bajo `/app/*`; sus
   tests siguen verdes, pero hasta entonces es el único layout sin superficie.
3. **El header público agrega un Tab stop** (el link de marca). Cambia el orden de tabulación que
   el e2e del shell daba por sentado; se corrigió el journey, no el layout.

## Delivery

`delivery_strategy=single-pr` (decisión del owner, 2026-10-18). Slice de esta feature: 1 commit
por tarea, 6 en total, ~1.400 líneas autoradas. Nada pusheado todavía.

## Log

**L1 — user request (verbatim):**
> vamos con el tticket recomendado

**L2 — native review (RDD on), lineage `review-812d6d98167877f5`:** el host RDD marcó el candidato
como no revisado, así que se corrió el review sobre el árbol congelado (base `3f549a0`). Tier
`medium`, dos lentes (`readability`, `reliability`), resultado **approved**; autoridad acknowledgeada
y quemada. Tres hallazgos, todos `informational` y sin corrección abierta:
`R2-unnecessary-cast-in-nav-callback` (`src/public-layout.tsx:91-93`), `R3-doc-ref-unverified`
(`docs/error-handling.md:80-91`) y `R3-e2e-literal-coupling` (`e2e/critical-journeys.spec.ts:11`).
