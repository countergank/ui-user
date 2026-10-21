# COU-278 — Construir el shell del dashboard

Linear: https://linear.app/countergank/issue/COU-278/construir-el-shell-del-dashboard
Branch: `feature/cou-278-construir-el-shell-del-dashboard` (cut from `develop` @ `29f9f5d`)
Feature identity: `COU-278-construir-el-shell-del-dashboard` (stable)

## Specs

**S1 — Layout**, verbatim: "`DashboardLayout` con sidebar colapsable (estado persistido) y topbar
con breadcrumb, selector de idioma, toggle de tema y menú de usuario (mi perfil, cerrar sesión)."

**S2 — Navegación**, verbatim: "Navegación declarativa filtrada por permisos (consume U06)."

**S3 — Main**, verbatim: "`main` con ancho y padding consistentes."

**S4 — A11y reutilizada**, verbatim: "Reutilizar los componentes de accesibilidad existentes."

**S5 — Non-goal**, verbatim: "**Fuera de alcance**: el contenido de cada sección."

**S6 — AC1**, verbatim: "El sidebar colapsa y expande, y recuerda el estado."

**S7 — AC2**, verbatim: "El ítem de la ruta activa queda marcado."

**S8 — AC3**, verbatim: "La navegación respeta los permisos del usuario."

**S9 — AC4**, verbatim: "Navegable completamente por teclado."

**S10 — AC5**, verbatim: "Test axe sin violaciones en el shell."

**S11 — AC6**, verbatim: "Funciona correctamente en light y dark (CV3, CV4)."

**S12 — Convenciones**, verbatim: "Cumple CV1-CV10. Depende de U06 y U08."

**S13 — Contexto**, verbatim: "El shell actual (`src/app-shell`) es el del template público:
navegación de `Home`/`About`, sin sidebar, sin topbar y sin selector de idioma. No sirve para una
consola de administración." · "Ya existen piezas reutilizables que deben conservarse: landmarks,
skip link y route announcer."

**S14 — ADR-13**, la decisión que este ticket implementa (`docs/adr.md`): la consola vive en
`/app/*`; "`AppShell` becomes the **console layout only**… Route-level layout split, not a
conditional inside one component"; "Post-login destination is `/app`. `DEFAULT_REDIRECT` in
`src/features/auth/safe-redirect.ts` changes from `/` to `/app`."

## Tasks

| ID | Task | Specs | Route | Commit |
|---|---|---|---|---|
| T1 | Cascarón de rutas: `/app/*` con el layout de consola; `/` y `/about` quedan en `PublicLayout` | S13, S14 | inline | 8f438dd |
| T2 | `DashboardLayout`: landmarks, skip link, announcer, `main` con ancho/padding consistentes | S1, S3, S4 | inline | 8f438dd |
| T3 | Sidebar colapsable con estado persistido (patrón de `lib/theme` → `lib/ui/sidebar*`) | S1, S6 | inline | 48e37ac |
| T4 | Sidebar móvil con `Sheet` + foco y teclado | S9, S11 | inline | 8f438dd |
| T5 | Topbar: breadcrumb, `LanguageSwitcher`, `ThemeSwitcher`, menú de usuario (mi perfil, cerrar sesión) | S1 | inline | 8f438dd |
| T6 | `ConsoleNav` montado en el sidebar, filtrado por permisos, ítem activo marcado | S2, S7, S8 | inline | 8f438dd |
| T7 | `DEFAULT_REDIRECT` a `/app` y destino post-login | S14 | inline | 65a85e2 |
| T8 | Copy i18n del shell en `en`/`es`/`pt` con paridad | S1, S12 | inline | 8f438dd |
| T9 | Tests: teclado, axe, light/dark, persistencia | S6, S9, S10, S11 | inline | f3319e7 |
| T10 | Gate completo (`make ci`) + docs | all | inline | 48e37ac+8f438dd+f3319e7+65a85e2 |

## Log

**L1 — Pedido original**, verbatim: "usa la skill kickoff"

L2 — Bootstrap (kickoff 2.0.0): proyecto Linear `ui-user` (`fd910edd-cbf7-4d13-8977-a09aa3cdba97`),
ticket COU-278 elegido entre los abiertos por **continuidad** (consume U06/COU-275, ya en
`develop`) y por **desbloqueo** (bloquea COU-274, que habilita la consola entera). Prioridad de
todos los abiertos: 0 (ninguna), así que el orden lo deciden continuidad y desbloqueo, no
prioridad.

L3 — Ticket completado antes de la primera edición: `project` = `ui-user`, `estimate` = 3
(confirmado por el humano con la escala `linear`), `assignee` = Leandro Javier Cepeda, estado
`In Progress`, `branchName` no vacío.

L4 — Evidencia de exploración que ajusta el alcance real: `src/features/console/navigation.ts` y
`console-nav.tsx` ya existen (COU-275, T4) con el manifiesto filtrado por `visibleNavItems`; falta
montarlos. `src/stores/use-ui-store.ts` ya expone `sidebarOpen` pero **no lo persiste** (solo el
tema se persiste desde `src/lib/theme/theme.ts`): ese es el delta de S6. `src/routes/index.tsx`
documenta que la mudanza del shell a `/app/*` es de este ticket (ADR-13).

L5 — U08 no está mapeado a un ticket en este repo (`grep` de `U08` solo devuelve paridad de i18n
en COU-281). Se interpreta como la paridad i18n `en|es|pt` (ADR-12), que este ticket respeta.

L6 — Decisiones de diseño tomadas durante la implementación (todas dentro del scope del
ticket, ninguna introduce producto nuevo):

- **`sidebarOpen` pasa a `true` por defecto** y `initialState` se actualiza con su test. Una
  consola que abre con la navegación escondida obliga a un clic en cada visita; colapsar es
  la elección deliberada, así que es la que se persiste (`countergank.ui.sidebar`). La
  hidratación vive en `main.tsx` vía `hydrateSidebarState()`, igual que el tema.
- **Dos disparadores de navegación, no uno**: `openMenu` (solo `<md`, abre el `Sheet`) y
  `collapseSidebar`/`expandSidebar` (solo `≥md`, persiste). Son comportamientos distintos y
  cada uno lleva su acción como nombre accesible. Colapsado significa **no renderizado**, no
  "escondido con CSS": una navegación oculta pero enfocable es una trampa de teclado.
- **Rutas pendientes**: `/app/*` y `/profile` renderizan `ConsolePlaceholder` en vez del
  `errorElement` del router, para que el manifiesto de COU-275 no lleve a un 404 dentro del
  shell. `/profile` queda registrada con el shell porque es el destino del menú de usuario y
  es superficie autenticada (COU-285/COU-288 la completan). Esto no es contenido de sección
  (S5): es andamiaje.
- **`ConsoleNav` gana un prop opcional `onNavigate`** para cerrar el drawer al navegar. Sin
  prop, el comportamiento de COU-275 no cambia (sus 3 tests siguen verdes).
- **`activeNavItem`**: la primera entrada del manifiesto (la raíz `/app`) matchea solo exacto;
  si no, reclamaría todo `/app/*` y una ruta desconocida se anunciaría como "Resumen".

L7 — Evidencia de TDD (RED observado antes de cada implementación):

- RED 1: `pnpm exec vitest run src/features/console/dashboard-layout.test.tsx src/lib/ui/sidebar.test.ts src/stores/use-ui-store.test.ts src/features/auth/safe-redirect.test.ts src/routes/routes.test.tsx`
  → "5 failed (5) | Tests 1 failed | 7 passed (8)": los módulos no existían y
  `DEFAULT_REDIRECT` seguía en `/`.
- GREEN: `src/features/console/dashboard-layout.test.tsx` → 17/17.
- Regresión detectada por la suite completa y corregida: `src/features/auth/login-redirect.test.tsx`
  esperaba `/` como destino por defecto; con ADR-13 es `/app` (S14). Actualizado a `/app` en
  los dos casos (sin destino y destino hostil).
- Regresión de lint: `pnpm lint` falló 6 veces (formato Biome, `no-confusing-void-expression`,
  `prefer-for-of`, `prefer-optional-chain`); corregido, lint y `pnpm typecheck` limpios.

L8 — Gate local completo: `make ci` **exit 0** = Biome + ESLint, `tsc -b --noEmit`,
`test:coverage` (446 tests, umbral 80% cumplido) y `vite build` de producción. El aviso de
chunks >500 kB es preexistente (vendor de React + Radix), no lo introduce este ticket.

L9 — Riesgo abierto y aceptado por el reparto de tickets de ADR-13: mientras COU-274 (guardas
de ruta) no exista, `/app` y `/profile` son alcanzables sin sesión. No exponen datos — el
placeholder no consulta la API y `usePermissions` no dispara nada si el estado es anónimo
(COU-275) — y la autorización real sigue en `api-user` (ASVS V8.3.1). Se documenta acá para que
la guarda se implemente en su ticket, no como un olvido.

L10 — Convención de rama: Linear propone `feature/cou-278-...` (minúsculas, prefijo
`feature/`) y el historial del repo usa `feat/COU-###-...`. Se respetó el `branchName` de
Linear — es el que mueve el ticket por automatización, y `docs/.github/FLOW.md` permite
`feature/*` — pero la inconsistencia con las ramas anteriores queda registrada acá.

L11 — Entrega en 4 work units sobre la rama (autorizadas por el humano sobre el diff):
`48e37ac` persistencia del sidebar, `8f438dd` shell + rutas + i18n + docs, `f3319e7` suite del
shell, `65a85e2` destino post-login. Los slices 2 y 3 se separaron por foco de review (fuente y
tests en commits consecutivos, cada uno con la suite verde); el slice del shell queda por encima
de las ~400 líneas y por eso se dividió ahí y no en otro punto.
