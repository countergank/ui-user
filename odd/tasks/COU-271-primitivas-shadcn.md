# COU-271 — shadcn primitives for the dashboard

Linear: https://linear.app/countergank/issue/COU-271/incorporar-las-primitivas-shadcn-que-necesita-el-dashboard
Branch: `feat/COU-271-primitivas-shadcn` (local only; cut from `develop` @ `426ae50`)
Feature identity: `COU-271-primitivas-shadcn` (stable — never overwrite another feature)

## Specs

**S1 — Scope.** COU-271 scope, verbatim: "Incorporar: `input`, `label`, `form` (react-hook-form + zod),
`textarea`, `select`, `checkbox`, `switch`, `badge`, `table`, `dialog`, `alert-dialog`,
`dropdown-menu`, `sheet`, `tooltip`, `popover`, `tabs`, `avatar`, `separator`, `skeleton`, `alert`,
`breadcrumb`, `pagination`, `sonner` (toast), `scroll-area`." — 24 primitives.

**S2 — Variants.** "Cada primitiva vive en `src/components/ui/` con variantes vía `cva` (CV2)."

**S3 — Tests.** "Cada primitiva tiene test de render y de accesibilidad, siguiendo el patrón de
`button.test.tsx`."

**S4 — Tokens only.** "Cero estilos inline y cero colores fuera de tokens (CV3)."

**S5 — Themes.** "Tema light y dark funcionando en cada primitiva."

**S6 — Non-goal.** "**Fuera de alcance**: componentes de dominio (tablas de usuarios, formularios de
negocio)." No `src/features/**` change is in scope.

**S7 — i18n parity (repo rule, ADR-12).** "`en`, `es`, and `pt` are the supported languages, with
mandatory key parity" (`docs/adr.md`, ADR-12), enforced by `src/lib/i18n/parity.test.ts`. Every
user-facing string a primitive ships itself, including screen-reader-only copy, lands in all three
bundles under `common.ui.*`.

**S8 — Coverage and colocation (repo rule).** "80% lines / branches / functions / statements"
(`vitest.config.ts`, `docs/testing.md`); tests colocate next to the code they verify. A primitive
without its colocated `*.test.tsx` does not satisfy S3.

## Tasks

| ID | Task | Specs | Route | Commit |
|---|---|---|---|---|
| T1 | Form field primitives: `input`, `label`, `textarea`, `checkbox`, `switch` | S1-S5, S8 | inline | S1 |
| T2 | `select` (Radix Select) | S1-S5, S8 | inline | S2 |
| T3 | `form` integration: `react-hook-form` + `zod` + `@hookform/resolvers` | S1-S5, S8 | inline | S3 |
| T4 | Display and data: `badge`, `separator`, `skeleton`, `avatar`, `table` | S1-S5, S8 | inline | S4 |
| T5 | Feedback: `alert`, `sonner` | S1-S5, S8 | inline | S5 |
| T6 | Overlays: `dialog`, `alert-dialog`, `sheet` + close-label copy | S1-S5, S7, S8 | inline | S6 |
| T7 | Menus and popups: `dropdown-menu`, `popover`, `tooltip` | S1-S5, S8 | inline | S7 |
| T8 | Navigation and structure: `tabs`, `breadcrumb`, `pagination`, `scroll-area` + pagination copy | S1-S5, S7, S8 | inline | S8 |
| T9 | Full gate: `lint`, `typecheck`, `test:coverage`, `build`; docs check | S2-S5, S8 | inline | S8 |

Route is `inline` for every task: a slice is one coherent unit of behavior whose tests, docs and code
belong together, and no slice is two independent units heavier than a subagent start.

## Findings that change the ticket

1. **CV1-CV10 are not defined anywhere.** Every ui-user ticket says "Cumple CV1-CV10" and COU-270
   supposedly defines them ("Este ticket define las convenciones transversales CV1-CV10"). They are
   not in the repo (`grep -r 'CV[0-9]'` finds only a lockfile hash), not in COU-270's Linear
   description (6,885 chars, stops after the class-naming section), not in its single comment, and
   not in the project description. Only four are recoverable from inline references: **CV2** =
   variants via `cva`; **CV3** = no inline styles, no colours outside tokens; **CV4** = light + dark
   (referenced with CV3); **CV7** = never render the backend's raw `message` (COU-276). The blanket
   "Cumple CV1-CV10" is therefore unverifiable. COU-271's own acceptance criteria are
   self-contained and this document does not pretend otherwise.
2. **There is no `components.json`.** The shadcn CLI was never initialised in this repo.
3. **No Radix primitives are installed.** The only `@radix-ui` package present was
   `@radix-ui/react-slot` (used by `button.tsx`). `react-hook-form`, `zod`, `@hookform/resolvers`
   and `sonner` are absent too.
4. **Tailwind is v3.4, not v4.** `tailwindcss@^3.4` + `tailwindcss-animate@^1`, with the token set
   wired through `theme.extend.colors`. Reference sources must be the Tailwind-3 generation of the
   shadcn sources, not the current v4 ones.

## Decisions

- **Install individual `@radix-ui/react-*` packages, not the consolidated `radix-ui` package.**
  `button.tsx` already imports `@radix-ui/react-slot` individually; mixing the two styles in one
  folder is an inconsistency the next reader pays for.
- **Hand-write each primitive following `button.tsx`, instead of running the shadcn CLI.** The CLI
  wants to own `components.json`, `tailwind.config.js` and `src/styles/index.css`, and this repo's
  colour values are enforced by the tokens-only guard. A generator rewriting `tailwind.config` or
  `index.css` can silently introduce a raw colour and break the guard for reasons a reviewer cannot
  see in the primitive's own diff.
- **A primitive that ships its own accessible copy reads it from i18n** (`common.ui.*` added to
  `en`, `es` and `pt`), rather than hardcoding English or forcing every caller to pass a label.
  Primitives with no copy of their own stay free of i18n imports.
- **No refactor of `button.tsx` or `card.tsx`.** They are existing behavior; this ticket adds
  primitives, it does not restyle the two that exist.

## Verification

Foreground, per slice and at close:

- `pnpm vitest run src/components/ui` — focused
- `pnpm lint` — biome + eslint (includes the no-hex rule and jsx-a11y strict)
- `pnpm typecheck` — `tsc -b --noEmit`, strict
- `pnpm test:coverage` — 80/80/80/80 gate
- `pnpm build` — type-check + bundle, at close

## Acceptance criteria mapping

| Ticket criterion | Where it is satisfied |
|---|---|
| Every primitive in `src/components/ui/` with `cva` variants (S2) | T1-T8; each file exports its `*Variants` where a variant axis exists |
| Every primitive has a render + accessibility test (S3) | colocated `*.test.tsx` per primitive, following `button.test.tsx` |
| Zero inline styles, zero non-token colours (S4) | no `style={{...}}`; only token utilities; enforced by both halves of the hex guard |
| Light + dark working (S5) | dark is `.dark` on `<html>`; primitives use semantic tokens only, so both themes come for free; asserted where a primitive has a theme-sensitive surface |

## Log

**L1 — user request (verbatim), 2026-10-17:**
> COU-271 - Incorporar las primitivas shadcn que necesita el dashboard
>
> Primero necesito que revises el proyecto usando codegraph, si no esta inicializado en este
> proyecto, inicializalo. Cuando termines con esto vamos a ir a buscar el contenido del ticket de
> linear del proyecto api-user, podes usar la variable de entorno LINEAR_API_TOKEN a nivel global
> para conectarte a la api de linear con mi cuenta y buscar el ticket COU-271, obtener el contexto de
> la implementacion ya realizada en la rama de github feat/COU-271-primitivas-shadcn

**L2 — user correction (verbatim), 2026-10-17:**
> vamos con ODD y realizamos la implementacion entoneces si es que no comenzo y tenemos algo ya
> hecho, revisaste la rama que te pedi?

**L3 — branch audit evidence (read-only), 2026-10-17:** the branch named in L1 carries no
implementation. `git worktree list` → one worktree; `git stash list` → empty;
`git log --all --grep=271` → no commits; `git diff --stat develop...HEAD` → empty;
`git reflog show feat/COU-271-primitivas-shadcn` → `branch: Created from HEAD` only; GitHub API
`repos/countergank/ui-user/branches` → no COU-271 branch; `gh search prs COU-271` → none;
`countergank/api-user` → no 271 branch, and it is the backend (no `src/components/ui`). Working tree
held only `package.json`/`pnpm-lock.yaml` (the three S1 Radix packages) plus this untracked plan.

**L4 — ticket content from Linear (API, `LINEAR_API_TOKEN`), 2026-10-17:** COU-271, state
"In Progress", project `ui-user`, labels `Feature`/`ui`, zero comments, zero attachments. The four
acceptance criteria and the scope line are quoted verbatim in S1-S6. "Cumple CV1-CV10" is present in
the description but only four of the ten are recoverable (see Findings 1).

**L5 — CodeGraph status, 2026-10-17:** already initialised (`.codegraph/codegraph.db`, daemon
running); no `init` needed. `explore` returned the blast radius this ticket must not break:
`Button` 5 callers, `Card`/`CardHeader`/`CardTitle` 4 callers each, `i18n` 9 callers.
