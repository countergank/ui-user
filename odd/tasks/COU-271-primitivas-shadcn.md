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
| T1 | Form field primitives: `input`, `label`, `textarea`, `checkbox`, `switch` | S1-S5, S8 | inline | `f8cf520` |
| T2 | `select` (Radix Select) | S1-S5, S8 | inline | `7d79a0c` |
| T3 | `form` integration: `react-hook-form` + `zod` + `@hookform/resolvers` | S1-S5, S8 | inline | `87bc9de` |
| T4 | Display and data: `badge`, `separator`, `skeleton`, `avatar`, `table` | S1-S5, S8 | inline | `0784496` |
| T5 | Feedback: `alert`, `sonner` | S1-S5, S8 | inline | `04d0aa8` |
| T6 | Overlays: `dialog`, `alert-dialog`, `sheet` + close-label copy | S1-S5, S7, S8 | inline | `a4644b3`, `bb2b90d` |
| T7 | Menus and popups: `dropdown-menu`, `popover`, `tooltip` | S1-S5, S8 | delegated (`gentle-ai-worker`, context backstop) | `32d8375`, `07add52` |
| T8 | Navigation and structure: `tabs`, `breadcrumb`, `pagination`, `scroll-area` + labels | S1-S5, S7, S8 | delegated (`gentle-ai-worker`, context backstop) | `5a5c07f`, `554c12c`, `be4733f` |
| T9 | Full gate: `lint`, `typecheck`, `test:coverage`, `build`; docs check | S2-S5, S8 | inline | gate run, no commit |

Supporting commits that are not slices of their own: `b112dfc` (deps), `39f5859` (this plan),
`92567d4` (i18n copy), `22029f0` (test guard + jsdom shims), `d1e14b0` and `fc6daa5` (fixes from
the independent verification).

Route is `inline` except T7 and T8, which were delegated after the harness signalled its context
backstop; both writers returned review-ready diffs and the parent re-verified every check and closed
the two gaps they reported. No slice is two independent units heavier than a subagent start.

## Progress

- [x] T1 — S1 — `f8cf520`. Evidence: RED first (5 files, "Failed to resolve import", 0 tests), then
  29/29 in `src/components/ui`. Two real defects fixed here: the Radix `Label` has no `disabled`
  prop (a test asserting it was wrong and was replaced), and shadcn's `peer-disabled:*` utilities
  were unreachable because `Input`/`Textarea` never declared `peer`.
- [x] T2 — S2 — `7d0a0c`. Evidence: RED, then 5/5. Finding 5 forced the shared inline-style guard.
- [x] T3 — S3 — `87bc9de`. Evidence: RED, then 5/5 through a real zod resolver and a real submit.
- [x] T4 — S4 — `0784496`. Evidence: RED (5 files), then 30/30 across the five primitives.
- [x] T5 — S5 — `04d0aa8`. Evidence: 10/10, including a real `toast()` assertion.
- [x] T6 — S6 — `a4644b3`, `bb2b90d`. Evidence: 21/21; the Spanish close-label test caught the
  `common.ui.*` key bug (finding 7).
- [x] T7 — S7 — `32d8375`, `07add52`. Worker evidence: 16/16 focused, eslint/biome/typecheck clean.
- [x] T8 — S8 — `5a5c07f`, `554c12c`, `be4733f`. Worker evidence: 25/25 focused, all checks clean.
  The worker reported two gaps it could not close inside its edit surface; the parent closed both.
- [x] T9 — Full gate — see Verification.

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

## Findings discovered during implementation

5. **Radix sets inline styles on nodes that carry our classes.** `SelectValue` hardcodes
   `style="pointer-events: none"`, and every modal overlay/content receives
   `style="pointer-events: auto"` from `react-remove-scroll`. "Zero inline styles" therefore cannot
   be asserted as "no `style` attribute anywhere". The shared guard
   (`src/test/inline-styles.ts`) forbids the *design* properties inline (colour, typography,
   spacing) and allows the library's mechanics.
6. **`React.ElementRef` is deprecated in the React 19 types.** `@typescript-eslint/no-deprecated`
   fails the lint gate on it. Every primitive uses `React.ComponentRef<T>` instead.
7. **The i18n namespace is `common`, so keys are `ui.*`, not `common.ui.*`.** The first version of
   `dialog.tsx`/`sheet.tsx` used the longer path, which i18next renders as a literal key — a
   screen-reader-only string reading `common.ui.close`. The Spanish assertion caught it; the
   English one compared the same wrong lookup to itself and had passed.
8. **jsdom cannot evaluate `:popover-open` / `:modal`, and has no `ResizeObserver`.** `nwsapi`
   recurses for ~50M steps on those selectors and `@floating-ui/dom` asks for both on every popper
   update, so any Radix popper hangs in jsdom. Both shims live in `src/test/setup.ts`, not duplicated
   per test file.
9. **`react/prop-types` misreads `React.Th/TdHTMLAttributes`.** It reports `className`/`scope` as
   unvalidated on `TableHead`/`TableCell`. `React.ComponentPropsWithoutRef<"th">` is read correctly
   without touching the shared ESLint config.

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

## Delivery

The feature is **one ticket, 16 work-unit commits, 4,165 authored lines**. Two strategies are
available and the choice is the user's, not the agent's: one PR with a maintainer-accepted
`size:exception` (COU-270 shipped 3,161 lines that way, PR #8), or chained PRs whose boundaries are
the commit groups above. `stacked-to-main` is invalid here (`.github/FLOW.md`: features target
`develop`). Push, PR and merge remain user decisions.

## Verification


Foreground, per slice and at close:

- `pnpm vitest run src/components/ui` — focused
- `pnpm lint` — biome + eslint (includes the no-hex rule and jsx-a11y strict)
- `pnpm typecheck` — `tsc -b --noEmit`, strict
- `pnpm test:coverage` — 80/80/80/80 gate
- `pnpm build` — type-check + bundle, at close

Observed at close (2026-10-17): `pnpm lint` exit 0; `pnpm typecheck` exit 0; `pnpm test:coverage`
exit 0 — 48 files, 301 tests, coverage 98.06 stmts / 95.94 branch / 93.54 funcs / 98.06 lines
against the 80/80/80/80 floor; `pnpm build` exit 0. `src/components/ui/` went from 2 primitives to
26 (24 new, plus the untouched `button`/`card`), each with a colocated render + axe test.

Known limitation: the scroll-area thumb cannot be asserted in jsdom (every box measures 0x0, so
Radix computes `hasThumb === false`); the scrollbar's mount and token classes are asserted instead.

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

**L6 — T1/S1 evidence, 2026-10-17:** RED first (`pnpm vitest run` on the five new test files: 5
failed, "Failed to resolve import", 0 tests). GREEN: 6 files / 29 tests. Corrected a test that
asserted a `disabled` prop `Label` does not have, and added the missing `peer` class to `Input` and
`Textarea` so the `peer-disabled:*` utilities in `labelVariants` actually apply.

**L7 — T2/S2 finding, 2026-10-17:** `SelectValue` renders `style="pointer-events: none"`. Guard
redesigned in `src/test/inline-styles.ts` (finding 5) and applied to every slice.

**L8 — T3/S3 evidence, 2026-10-17:** RED, then 5/5. `@typescript-eslint/no-misused-promises` forced
the test's `onSubmit` to stay void, which is the correct DOM contract.

**L9 — T4/T5 evidence, 2026-10-17:** 40 focused tests across eight primitives. Two tests were wrong
before the code was: Radix omits `aria-orientation` for an implicit horizontal separator, and the
`<th>` needs an explicit `scope="col"` (added to the primitive, not just the test).

**L10 — T6 evidence, 2026-10-17:** 21/21. The i18n key bug (finding 7) was caught here; the English
assertion had compared `i18n.t(key)` with itself and passed, so the English tests were hardened to
concrete literals ("Close") and the Spanish ones kept as parity proof.

**L11 — T7/T8 delegated, 2026-10-17:** the harness signalled its context backstop at ~151k tokens,
so the two remaining independent slices went to `gentle-ai-worker` with disjoint allowed edit
surfaces. Returned evidence: S7 16/16 + eslint/biome/typecheck clean; S8 25/25 + clean, with RED
not observed and honestly reported, compensated by a mutation check that produced exactly the two
expected failures. The worker reported two gaps outside its surface; the parent closed them: the
`breadcrumb`/`pagination` landmark labels now come from `ui.breadcrumb.label` /
`ui.pagination.label` in `en`/`es`/`pt` (S7 was only partly satisfied without them), and the four
duplicated jsdom shims were hoisted into `src/test/setup.ts` (finding 8).

**L12 — close, 2026-10-17:** full gate green (see Verification). One deviation recorded rather than
hidden: the three popper test files scan `document.body` with axe's page-level `region` rule
disabled, because a floating layer portaled to `<body>` can never sit inside a landmark on a bare
test page and the flagged node is Radix's own popper wrapper. Every other axe rule stays active.

**L13 — independent verification and its fixes, 2026-10-17:** the Risk line names Task Size item 5
(dependencies added, shared test infrastructure changed), so `gentle-ai-verify` reviewed exactly two
claims. It confirmed: `package.json` only adds entries (17 added, 0 removed, 0 version-changed among
pre-existing packages), every added Radix package declares React 19 peers, the shims are narrow and
restored, the helper is non-vacuous for modals, and `button.tsx`/`card.tsx`/`button.test.tsx`/
`eslint.config.js` are byte-identical to `develop`. It found one real defect and one weakness:

1. **Split install of `@radix-ui/react-slot`** — 1.3.3 from the pre-existing direct `"^1"` spec and
   1.5.0 pulled transitively by the new Radix packages. Fixed in `d1e14b0` by raising the direct
   spec to `^1.5.0`; the lockfile now holds a single version (`grep 'react-slot@1.3.3'` → 0).
2. **The inline-style guard did not inspect the container itself** and omitted `box-shadow`. Fixed in
   `fc6daa5`. The property list still excludes `width`/`height`/`inset`/`transform` on purpose:
   Radix sets those inline on popper wrappers and hidden sentinels, and flagging them would fail on
   the library's mechanics rather than on a design decision.

Re-verified after both fixes: `pnpm vitest run` 48 files / 301 tests passed; `pnpm test:coverage`
exit 0 with 98.06 / 95.94 / 93.54 / 98.06; `pnpm lint`, `pnpm typecheck` and `pnpm build` exit 0.

## Review chain (user decision: chained review per work unit)

The whole branch cannot be reviewed natively: `review.start` for the accumulated candidate
(57 paths, 5,652 lines) failed preflight with `lens_context_budget_exceeded`,
`mutation_outcome: not_started` — no authority was created, so nothing was abandoned or repaired.
The user chose a chained review, one work unit per candidate with `HEAD` at the unit's tip and
`baseRef` at the previous tip.

| Unit | Range | Lines | Lineage | Outcome |
|---|---|---|---|---|
| R1 support (deps, plan, i18n, test infra) | `develop..22029f0` | 1,650 | `review-afbf2d3deca75164` | approved, acknowledged, authority burned |

R1 lenses: risk, readability, reliability (resilience not pertinent). 7 advisory findings, all
non-blocking and informational: `R2-guard-regex-gaps`, `R2-matches-capture`, `R2-mirror-doc-drift`,
`R3-inline-guard-longhand-gaps`, `R3-jsdom-toplayer-selector-exactness` (WARNING, still
non-blocking), `R3-suite-wide-matches-override`, `R3-unstub-all-globals`.

Remaining units, unchanged from the commit map: T1 `22029f0..f8cf520`, T2 `..7d79a0c`,
T3 `..87bc9de`, T4 `..0784496`, T5 `..04d0aa8`, T6 `..bb2b90d`, T7 `..07add52`,
T8 `..be4733f`, fixes `..54319e3`.

## Delivery (chained PRs, merged slice by slice onto `develop`)

Strategy chosen by the user: `stacked-to-main` — verified default branch `develop`, PR #1 based on
`develop`, each later PR based on its immediate parent until that parent merges.

| PR | Branch | Base | Changed lines | Local verification | CI |
|---|---|---|---|---|---|
| #10 | `feat/COU-271-01-support` | `develop` | +1,573 / -77 | — | **pass**: quality-gates, e2e, commitlint, preview build |
| #11 | `feat/COU-271-02-forms` | `feat/COU-271-01-support` | +1,013 | 31 files / 200 tests, lint 0, typecheck 0 | base-branch gated |
| #12 | `feat/COU-271-03-display-feedback` | `feat/COU-271-02-forms` | +756 | 38 files / 240 tests, lint 0, typecheck 0 | base-branch gated |
| #13 | `feat/COU-271-04-overlays` | `feat/COU-271-03-display-feedback` | +688 | 41 files / 260 tests, lint 0, typecheck 0 | base-branch gated |
| #14 | `feat/COU-271-05-menus` | `feat/COU-271-04-overlays` | +651 | 44 files / 276 tests, lint 0, typecheck 0 | base-branch gated |
| #15 | `feat/COU-271-06-navigation` | `feat/COU-271-05-menus` | +956 / -54 | full gate at this tip: 48 files / 301 tests, coverage 98.06 / 95.94 / 93.54 / 98.06, build 0 | base-branch gated |

`#10` was also verified locally before pushing (24 files / 165 tests, lint 0, typecheck 0).

### Known constraint: CI is base-branch gated

`.github/workflows/ci.yml` runs `pull_request` only for PRs targeting `develop`. Child PRs point at
their parent branch, so GitHub reports no checks for them until they are retargeted to `develop`
after the parent merges. Until then, each child is verified locally with the evidence above; the
clean-diff property is preserved (every PR shows only its own slice), which is the reason for the
chaining in the first place. The alternative — basing every child on `develop` — would show
cumulative diffs and was rejected.

### Merge order

#10 → retarget #11 to `develop` → merge #11 → retarget #12 → … → #15, which completes the ticket.
The local integration branch `feat/COU-271-primitivas-shadcn` is now redundant and can be deleted
after the chain merges; it was never pushed.

### How this landed

The chained PRs #10-#15 merged slices 2-6 into their parent branches rather than into `develop`
(a chain accumulates on its children by construction), so only slice 1 reached `develop` as #10.
The remaining work landed through PR #16 (`feat/COU-271-primitivas-restantes`), based on `develop`
and carrying 17 cherry-picked work-unit commits plus the two fixes. #16 was squash-merged as
`d6b3a85`, and `develop` is identical to the branch that was reviewed (`git diff 7af7a1a
origin/develop` is empty).

The hashes in the Tasks table are the originals. Their branches were deleted after the merge, so
they are no longer reachable by branch name: they survive inside the merged PRs (#11-#15) and in
GitHub's `refs/pull/*/head`. The cherry-picked copies on `develop` have new hashes and identical
trees.

**L14 — close-out, 2026-10-17:** PR #16 squash-merged as `d6b3a85` after CI passed (quality-gates,
e2e, commitlint, preview build), with `develop` verified identical to the reviewed branch tree.
COU-271 moved to Done in Linear. Every COU-271 branch was deleted, local and remote, after the merge;
the original commit hashes remain reachable through the merged PRs and `refs/pull/*/head`. The
coverage gate that went red at close was not a regression: the `all` scan was counting the review
candidate views stored under `.git/gentle-ai/candidate-views/`, fixed by excluding `.git/**` in
`vitest.config.ts` (98.06% restored).
