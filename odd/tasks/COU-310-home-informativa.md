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

**S10 — Footer al pie**, verbatim: "Ademas about deja pegado al texto el footer, no queda al final
de la pagina".

**S11 — Logo**, verbatim: "falta logo de countergank que lo podes encontrar en el directorio public, los
acabo de agregar" · "el logo si y debe estar al lado del titulo en el header de la app en la barra de
navegacion" · "el banner no lo usamos todavia, no hace falta".

**S12 — Selector de idioma**, verbatim: "el texto contenido actualmente no se le puede cambiar el
idioma porque no hay boton de seleccion de idioma, deberia haber uno".

**S13 — Embellecer**, verbatim: "la idea principal, embellecer el home y about que estan muy simples
y feas a vista humana".

## Tasks

| ID | Task | Specs | Route | Commit |
|---|---|---|---|---|
| T1 | `PublicLayout` (header, nav, skip link, announcer, main, footer) + split de rutas para `/` y `/about` | S1, S3, S8 | inline | T1 |
| T2 | Landing informativa: hero, qué es, servicio, features, quickstart, stack, links | S1, S4 | inline | T2 |
| T3 | `/about` reescrita para describir el proyecto | S1, S6 | inline | T3 |
| T4 | Retirar la home del template y probar que lo público no llama a la API | S2, S7 | inline | T4 |
| T5 | Adaptar la suite e2e a la superficie pública | S3, S8 | inline | T5 |
| T6 | Gate completo + docs | all | inline | T6 |
| T7 | Footer al pie: wrapper flex column en `PublicLayout` y `AppShell` | S10 | inline | T7 |
| T8 | Logo inline con `currentColor` en el header + favicon | S11 | inline | T8 |
| T9 | Selector de idioma con persistencia y `<html lang>` sincronizado | S12 | inline | T9 |
| T10 | Home: hero, feature grid con iconos, quickstart y stack badges | S13 | inline | T10 |
| T11 | About: dos columnas y tarjeta de estándares | S13 | inline | T11 |

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

## Decisions (requirements change, 2026-10-19)

- **Banner fuera.** No se usa: `banner.png` (4.3 MB) y `logo.png` (382 KB) no entran al repo. Assets
  commiteados: el SVG del logo (10.7 KB) y el `.ico` del favicon (14.5 KB).
- **Logo inline, no `<img>`.** Un SVG servido por `<img>` no hereda `currentColor`, y este logo es
  monocromo con `fill="#000000"`: sobre fondo oscuro desaparecería. Se inlinea como componente y
  hereda el token `foreground`.
- **Default de idioma sigue en `en`**, con el selector como única vía de cambio; la detección del
  idioma del navegador pertenece a COU-277.

## Progress (requirements change, T7-T11)

- [x] T7 — Footer al pie — `d6140c7`. Causa raíz: `main.flex-1` sin padre flex y sin
  `min-h-screen`. Ambos layouts envuelven ahora sus landmarks en una columna de altura completa;
  el e2e mide el hueco contra el viewport (0 px en `/about`), no confía en una clase.
- [x] T8 — Logo — `d6140c7`. SVG inline con `currentColor` (un `<img>` no puede recolorear un
  relleno negro y desaparecía en dark), recorte del `viewBox` medido con un render headless
  (~60% x ~41% de canvas útil), favicon `.ico`. Assets commiteados: 25 KB. El primer intento
  olvidó el `<g transform>` del original y el logo no se veía: lo detecté mirando la captura del
  header, no el test.
- [x] T9 — Selector de idioma — `45b72dd`. Menú (no botón cíclico), persistencia con la misma forma
  que el tema, lectura durante la creación de la instancia i18n y `<html lang>` sincronizado.
- [x] T10 — Home — `122fdbe`. Hero con dos CTA, prosa en dos columnas, features con iconos,
  quickstart tipo terminal y stack en badges, dentro de una columna centrada.
- [x] T11 — About — `3b169f2`. Dos columnas, tarjeta de contribución y cuatro links a archivos
  reales de `docs/` (aserción en el test de rutas).
- [x] T8b — Logo en color — `ebea400`. El dueño rechazó el arte monocromo ("se rompe todo") y pidió el
  de color. El PNG original (2048², 382 KB, fondo blanco sin transparencia) se recorta al isotipo
  —sin el wordmark, que duplica el título— y se convierte el blanco en transparencia real con un
  render headless, sin agregar dependencias: 512×263, 95 KB. Como la "C" del arte es negra, el tema
  oscuro conserva la variante monocroma inline; negro sobre fondo oscuro no es una decisión de
  marca, es un logo faltante. Primer intento de commit incluía `banner.png` (4.3 MB) y `logo.png`
  (382 KB) por un `git add -A public`; se corrigió con `--amend` y quedan fuera del repo.
- [x] T8c — El ícono de color (`logo-countergank-icon.ico`) — el dueño señaló que seguía viendo el
  arte monocromo: en tema oscuro `AppLogo` mostraba la variante inline y el color nunca aparecía.
  El `.ico` trae un PNG RGBA 256×256 (14.5 KB, transparente) que se extrae como
  `public/logo-countergank-icon.png` y es el único arte en los dos temas; como su "C" es negra, en
  oscuro lleva un fondo claro. Se retira el componente monocromo y el derivado anterior
  (`logo-countergank-color.png`). El wordmark "COUNTERGANK" viaja dentro del ícono y se repite con
  el título: queda a la vista del dueño decidir si se recorta.
- [x] Gate — `make ci` exit 0: 61 archivos, 395 tests, coverage 98.19 / 94.07 / 93.49. El guard de
  tokens atajó un `#000000` que había quedado en el docblock del logo; se reescribió el comentario.

## Corrections (review findings)

Los tres hallazgos del review, resueltos en un solo commit de corrección:

- **`R2-unnecessary-cast-in-nav-callback`** — arreglado. `renderNav` tipa su traductor como
  `TFunction<"landing">`, así que el call site pasa `t` directo y el cast desaparece.
- **`R3-e2e-literal-coupling`** — arreglado. El spec de Playwright importa `en` (el bundle de
  referencia) y deriva título, labels de nav, skip link y el template del anuncio, en vez de
  retipear el copy: un cambio de copy ya no rompe el e2e.
- **`R3-doc-ref-unverified`** — verificado, no requería cambio. El snippet de
  `docs/error-handling.md` coincide literalmente con `login-page.integration.test.tsx:105`
  (`server.use(http.post(LOGIN_URL, () => apiFailure(401, "UA-AUTH-002")))`), y las cuatro
  afirmaciones del párrafo existen en ese archivo: alert con foco (l. 112), 429 con submit
  deshabilitado (l. 140), `aria-describedby` con foco en el campo (l. 154-155).

## Log

**L1 — user request (verbatim):**
> vamos con el tticket recomendado

**L3 — user request (verbatim), requirements change on the delivered ticket:**
> ok falta logo de countergank que lo podes encontrar en el directorio public, los acabo de agregar, falta mejorar los componentes de home, el texto contenido actualmente no se le puede cambiar el idioma porque no hay boton de seleccion de idioma, deberia haber uno, y la idea principal, embellecer el home y about que estan muy simples y feas a vista humana. Ademas about deja pegado al texto el footer, no queda al final de la pagina, hace una lista de como vas a proceder paso a paso arreglando lo que te pedi, no apliques nada todavia

**L4 — user answer (verbatim):**
> el banner no lo usamos todavia, no hace falta, el logo si y debe estar al lado del titulo en el header de la app en la barra de navegacion

**L5 — user answer (verbatim)**, on the three ways to make a monochrome logo work in dark mode:
> la recomendada

**L2 — native review (RDD on), lineage `review-812d6d98167877f5`:** el host RDD marcó el candidato
como no revisado, así que se corrió el review sobre el árbol congelado (base `3f549a0`). Tier
`medium`, dos lentes (`readability`, `reliability`), resultado **approved**; autoridad acknowledgeada
y quemada. Tres hallazgos, todos `informational` y sin corrección abierta:
`R2-unnecessary-cast-in-nav-callback` (`src/public-layout.tsx:91-93`), `R3-doc-ref-unverified`
(`docs/error-handling.md:80-91`) y `R3-e2e-literal-coupling` (`e2e/critical-journeys.spec.ts:11`).
