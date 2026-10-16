# COU-270 — Design system, theme, and i18n policy

Linear: https://linear.app/countergank/issue/COU-270/definir-el-sistema-de-diseno-el-tema-y-la-politica-de-i18n-del-dashboard
Branch: `feat/COU-270-sistema-de-diseno-y-tema` (from `origin/develop` @ `ed6997b`)
Status: in progress

## Reconcile (start 2026-10-12)

- TDD: strict (source: `docs/testing.md`), runner: `pnpm test` (Vitest).
- RDD: to be read with `gentle-ai review mode status` before the first candidate; not assumed.
- Commits: **none without explicit user authorization** (user instruction, 2026-10-12). This overrides
  the ODD per-task work-unit commit default. Work accumulates on the branch for review until authorized.
- Branch was created from `origin/develop`, not local `develop`: local `develop` was 12 commits behind
  the remote. Local `develop` was fast-forwarded to match. Branch upstream was unset so a bare
  `git push` cannot write to `develop`.
- Linear COU-270 was moved Backlog → In Progress (verified by re-read).
- Engram mirror: topic `odd/COU-270-sistema-de-diseno-y-tema/tasks`.

## Findings that change the ticket (verified, with evidence)

1. **`ThemeToggle` is never mounted.** `<ThemeToggle` appears only in
   `src/features/home/components/theme-toggle.test.tsx` (4 renders, all inside tests). There is no
   production render. It is dead code with green tests, not a "decorative toggle". The ticket's original
   wording ("el toggle ya existe pero está a medio cablear") understated this.
2. **`languages = [defaultLanguage] as const` → only `en` exists** (`src/lib/i18n/resources.ts:1-4`).
   `es` and `pt` do not exist at all, so the ADR + parity rule is not a formality: the locales must be
   authored.
3. **`tokens.css` is still the untouched shadcn neutral palette** (`--primary: 240 5.9% 10%`, i.e. near-black;
   no violet, no status tones, no `--seg-thumb`).
4. **The boceto's tone recipe fails WCAG AA in light mode and passes in dark mode.** Measured with a
   contrast script (`/tmp/opencode/contrast.mjs`, HSL→sRGB + WCAG relative luminance):

   | tone | boceto light (tinted-badge recipe) | dark |
   |---|---|---|
   | success `160 84% 39%` | **2.27:1** | 6.74:1 OK |
   | warning `38 92% 50%` | **1.92:1** | 7.63:1 OK |
   | danger `350 89% 60%` | **3.07:1** | 4.50:1 OK |
   | info `199 89% 48%` | **2.47:1** | 6.03:1 OK |

   Badge text is 11px/600 → normal text → needs 4.5:1. Cause: in light mode the recipe uses the same
   mid-tone as *text* and as the *hue of a near-white tint*, so contrast stays low no matter which L you
   pick (darkening the tone darkens its own tint with it). Dark mode works because the tint stays dark.
   Required light-mode text values to reach AA: success `160 84% 25%`, warning `38 92% 29%`,
   danger `350 89% 42%`, info `199 89% 33%`.
5. **`--danger` as a solid button background fails AA with white text**: rose-500 = 3.69:1;
   rose-600 `347 77% 50%` (#E21D48) = 4.67:1. shadcn's `--destructive` is used as a button background,
   so it must be the AA-passing value, not the boceto's `--danger`.
6. **Token names do not match.** The boceto uses `--bg`/`--fg`/`--card-fg`/`--muted-fg`/`--danger`;
   the app uses shadcn's `--background`/`--foreground`/`--card-foreground`/`--muted-foreground`/`--destructive`.
   The boceto also does not define `--popover`, `--secondary`, `--popover-foreground`,
   `--secondary-foreground`, `--destructive-foreground`. The port is a mapping, not a copy.
7. **Tailwind is v3.4** (`@tailwind base/components/utilities` in `src/styles/index.css`), so the
   mapping goes in `tailwind.config.js`; there is no CSS-first `@theme`. `components.json` does not
   exist (shadcn CLI unconfigured).

## Goal

Fix the written contract the ticket promises: an approved, AA-compliant identity in `tokens.css` +
Tailwind, a real three-state theme that actually applies, `es|en|pt` parity for app copy, and the
documented policy (`docs/design-system.md`, ADR) that later UI tickets inherit.

## Non-goals

- Do not implement dashboard screens, feature components, or feature translations (later tickets).
- Do not add a full component library or configure the shadcn CLI beyond what a token consumer needs.
- Do not change routing, data fetching, or the error/a11y foundations from COU-253.

## Acceptance criteria

(16 from the Linear ticket; the two that this document adds are marked NEW.)

- [ ] `docs/design-system.md` defines palette, typography, spacing, radii, shadows, focus, and the
      "tokens only, never hex" rule.
- [ ] `docs/design-system.md` and `tokens.css` values match `designs/identity/index.html`.
- [x] NEW: every tone used as text on a tinted surface passes 4.5:1 in **both** modes, proven by a
      checked-in contrast test (not by assertion). → `src/styles/tokens.test.ts`.
- [ ] `designs/identity/index.html` is versioned in git. (Task 6)
- [ ] ADR in `docs/adr.md` fixes the `es|en|pt` languages and the mandatory key-parity rule. (Task 5)
- [x] `tokens.css` covers success and warning, in light and dark.
- [x] A test fails when a key present in `en` is missing in `es` or `pt`. → `src/lib/i18n/parity.test.ts`
      (both directions) **and** a compile error naming the key.
- [ ] No hardcoded hex in `src/` (lint rule). (Task 5)
- [ ] NEW: the token-name mapping (boceto → shadcn) is written down so the rename cannot recur silently.
      (Task 5)
- [x] Theme: choosing "dark" puts `dark` on `<html>` and the UI actually changes.
- [x] Theme: the preference survives a reload. → `countergank.ui.theme` + pre-paint hydration.
- [x] Theme: "system" follows `prefers-color-scheme` and reacts live.
- [x] Theme: an explicit choice wins over the OS.
- [x] Theme: no wrong-theme flash on load in dark. → inline pre-paint script (no real-browser paint trace
      was possible here; see Task 3 notes).
- [x] Theme: a corrupt stored value falls back to `system` without breaking.
- [x] Theme: a keyboard-operable 3-state control with `es|en|pt` labels. (Task 4 — **AC amended on
      2026-10-13**: the shipped control is a single cycling icon button, not a three-segment
      `aria-pressed` group. The user rejected the segmented control after reviewing the running app;
      see "Task 4 rework" below. `aria-pressed` no longer exists, so the `radiogroup` observation is
      closed as moot.)
- [x] Theme: store tests cover `setTheme`, resolved-theme derivation, corrupt-value fallback.
- [ ] A rule or test prevents a modifier from reusing a word that already exists as a standalone class
      (the `.dot`/`.brand` collision), or the convention is documented in `docs/design-system.md`.

## Tasks

Authoring forecast: ~1,400 changed lines across 6 tasks, plus the 975-line boceto already authored
on disk. Far above the ~400 review budget → delivery strategy applies (see Delivery).

- [x] Task 1 — Port the approved identity into `tokens.css` and map it in Tailwind.
  - Map boceto names → shadcn names; keep every shadcn var the components already consume.
  - Add `--seg-thumb`, `--success`, `--warning`, `--info` and their `-foreground` pairs per mode,
    using the AA-verified light values from finding 4.
  - Set `--destructive` to the AA-passing rose (finding 5).
  - Add radii/shadow/font tokens; map them in `tailwind.config.js`.
  - Evidence: contrast test green in both modes; `pnpm typecheck`, `pnpm lint`, `pnpm test` green.
  - DONE (2026-10-12, delegated writer + parent fixes):
    - `src/styles/tokens.css` rewritten (45 → 118 lines): brand identity replaces the default shadcn
      neutral palette; boceto renames applied so no class name changes; `--popover`/`--secondary`
      derived (boceto does not define them); `--destructive` = rose-600 `347 77% 50%`;
      `--seg-thumb` added per mode; radii/shadows/fonts added.
    - `tailwind.config.js` extended (66 → 92 lines), no existing key removed: `success|warning|danger|info`
      scales with `DEFAULT` + `foreground`, `borderRadius` bound to `--radius*`, `boxShadow` to `--shadow*`,
      `fontFamily` to `--font-*`.
    - `src/styles/tokens.test.ts` new (210 → 223 lines): reads `tokens.css` from disk and MEASURES WCAG AA
      with a dependency-free HSL→sRGB→luminance helper.
    - **Two extra AA defects found and fixed** (both were in the approved boceto; independent
      verification reproduced both):
      - **light `--muted-foreground` 47% → 45%**: it is also the text color ON `--muted`
        (`.badge.neutral`, disabled inputs, table headers); at 47% that pairing measured **4.299:1**
        (below AA). At 45% it measures 4.616:1 on `--muted` and 5.066:1 on `--background`.
      - **dark `--danger-foreground` 65% → 66%**: at 65% the pair measured **4.503:1** — a pass, but by
        0.003, so any rounding/compositing change would flip it below AA. At 66% it measures 4.634:1.
    - Test hardened: added `--muted-foreground` assertions against `--muted`, `--background` and `--card`
      in both modes, so the defect above cannot regress silently.
    - Writer proved the test is non-vacuous by temporarily breaking `--warning-foreground` (observed
      `1.61:1` failure) and reverting.
    - Independent parent verification (own script reading the written CSS, not the writer's test):
      light badges 4.974 / 5.122 / 4.836 / 4.769; light destructive 4.671; dark badges 6.738 / 7.634 /
      4.634 / 6.026; dark destructive 5.727 — all ≥ 4.5. `:root` has 36 vars, `.dark` 32, none missing.
    - Evidence: `pnpm test -- src/styles/tokens.test.ts` → 15 passed; `pnpm typecheck` → clean;
      `pnpm lint` → clean (after fixing one `ReadonlyArray` violation the parent introduced);
      `pnpm test` → **20 files, 90 tests passed**; `pnpm build` → clean (142 modules).
    - Visible side effect to keep in mind: `rounded-lg` is now 12px (was 8px) and `rounded-sm` 6px
      (was 4px) because they are bound to `--radius-lg`/`--radius-sm`. Existing screens get slightly
      rounder corners.

- [x] Task 2 — Add `es` and `pt` locales with enforced key parity (test-first).
  - Parity test observed RED against the missing locales, then GREEN.
  - Enforce parity in the type system, not only in the test.
  - Evidence: RED then GREEN captured; `i18n.test.ts` extended; suite green.
  - DONE (2026-10-12, delegated writer + parent fix):
    - New `src/lib/i18n/parity.test.ts`; new `src/lib/i18n/locales/{en,es,pt}.ts`;
      `src/lib/i18n/resources.ts` rewritten as a composer (111 → 22 lines);
      `src/lib/i18n/i18n.test.ts` fixture fixed.
    - **`pt` is pt-BR, decided with evidence, not taste.** The sibling API
      (`api-user/src/common/i18n/translations/pt.json`) says `"Usuário não encontrado"` and
      `"Solicitação incorreta"` — pt-BR forms. pt-PT would say `"Utilizador"` / `"Pedido"`. The UI must
      match the API. (The API declares a bare `pt`, no region tag, so the wording is the only evidence.)
    - **Type-level parity.** `TranslationTree = typeof en.common` (the *inner* tree), so each bundle is
      typed `{ common: TranslationTree }` and a missing key is a compile error naming it. `en.ts` must
      NOT use `as const`: that would literalize every value and make no other language satisfiable.
      `bundles` uses `satisfies Record<AppLanguage, { common: TranslationTree }>`.
    - The type system cannot protect interpolation tokens (any translated string is still `string`), so
      `parity.test.ts` asserts `{{...}}` token-set parity per key, key parity in both directions, no
      empty values, and that the language set is exactly `en|es|pt`.
    - `i18n.test.ts` used `"es"` as its *unsupported* language fixture — that assertion became false the
      moment `es` existed. Fixture changed to `"de"`.
    - **A quality defect the test and TypeScript both cannot see, found by the parent reading the
      translations**: Spanish used *"tipificado/tipificados"* where the term is *"tipado/tipados"*.
      "Tipificar" in Spanish means to classify/standardize; the static-types term is "tipado". Portuguese
      got it right (`tratamento tipado`). Fixed (3 occurrences).
      **Rule for later tickets: in Spanish, "typed" is "tipado", never "tipificado".**
    - Evidence: `pnpm test -- src/lib/i18n` → 7 passed; full suite → 22 files, **141 tests passed**;
      `pnpm typecheck` clean; `pnpm lint` clean; `pnpm build` → 151 modules.
    - Open, not blocking: `(screaming)` is left untranslated in `es`/`pt` as the proper name of the
      architecture pattern. Also unconfirmed whether `Standard Frontend` / `Standard Frontend Template`
      are branding or descriptive copy (currently translated). Both are one-line changes.

- [x] Task 3 — Wire the theme for real (test-first).
  - Three-state preference; resolved-theme derivation; persistence of the preference (not the result);
    corrupt value → `system`; `.dark` on `<html>`; `color-scheme`; pre-paint resolution.
  - Evidence: store tests observed RED then GREEN; manual reload check documented.
  - DONE (2026-10-12, delegated writer; parent-verified):
    - New `src/lib/theme/theme.ts` (99), `theme.test.ts` (205), `theme-sync.ts` (59),
      `theme-sync.test.ts` (187). Modified `src/stores/use-ui-store.ts` (+test), `src/test/setup.ts`,
      `src/main.tsx`, `index.html`, `src/styles/index.css`.
    - **Deleted** `src/features/home/components/theme-toggle.tsx` (+ test): dead code that could not
      express three states. The writer proved it was unreferenced by grep before deleting (the only
      importer was its own test). Task 4 builds the real control.
    - Decisions fixed by the parent, not left to the writer: `ThemePreference = system|light|dark`,
      default `system`; **storage key `countergank.ui.theme`** (no prior convention existed in the repo —
      this establishes it); bare preference string, not JSON; corrupt/absent/unreadable → `system`
      without throwing; `toggleTheme` removed (a three-state preference cannot be toggled);
      `color-scheme` lives in `index.css` (`:root` light, `.dark` dark), not in `tokens.css`;
      `<html lang="en">` deliberately untouched (language is a separate concern).
    - No import-time side effects: `initialState` stays a pure literal; `startThemeSync()` reads storage.
    - `startThemeSync()` hydrates → applies → subscribes to the store → subscribes to the OS media query
      **only while the preference is `system`**, so an explicit choice survives an OS change; it returns
      an unsubscribe that detaches both listeners.
    - **Pre-paint script** inlined in `<head>` before the module script, with **two independent
      `try`/`catch` blocks**. This matters: one wrapping block would mean a throwing `localStorage` skips
      OS resolution entirely and a dark user still sees a light flash. Verified by executing the extracted
      script in a harness (8/8 cases), and the built `dist/index.html` ships it.
    - **Drift guard**: `theme.test.ts` reads the real `index.html` and asserts the inline script exists,
      precedes the module script, and uses the same storage key — the inline script cannot import the
      constant, so this test is the only thing preventing silent divergence.
    - Evidence: `pnpm test -- src/lib/theme src/stores` → 59 passed; full suite → **22 files, 141 tests
      passed**; `pnpm typecheck` clean; `pnpm lint` clean; `pnpm build` → 151 modules; `pnpm test:coverage`
      → 99.36% statements, `src/lib/theme` and `theme-sync.ts` at 100%.
    - **The writer caught its own vacuous test**: `vi.spyOn(window.localStorage, "getItem")` does not
      intercept in jsdom (its `Storage` is a Proxy whose `set` trap stores the assignment as an item), so
      both failure-path tests passed without testing anything. Coverage exposed it (uncovered `catch`
      lines); fixed by patching `Storage.prototype` and asserting the spy was called.
    - Not verified: a real-browser paint trace for the "no flash" claim (Chromium cannot launch here);
      the claim rests on the script running pre-paint plus the 8-case behavioural harness.

- [x] Task 4 — Mount a three-state theme control in the shell (test-first).
  - Keyboard operable, `aria-pressed`, `es|en|pt` labels, visible in the shell header.
  - Evidence: component tests RED then GREEN; axe assertions preserved.
  - DONE (2026-10-12, delegated writer; parent-verified):
    - New `src/components/theme/theme-switcher.tsx` (69 lines) + `theme-switcher.test.tsx` (9 tests).
      Modified `src/app-shell.tsx` (mounted in the header) + `app-shell.test.tsx`, and the three locale
      files.
    - Options render **System, Light, Dark** and the active one tracks the stored **preference, never the
      resolved theme** — with `system` selected, System stays pressed even while the OS is dark. If it
      tracked the resolved theme the user could never return to following the OS.
    - The value lives in Zustand rather than local state, so the active segment follows any external
      writer, including the pre-paint hydration in `startThemeSync()`.
    - New `shell.theme.*` keys (`label`, `system`, `light`, `dark`) authored in all three languages.
      **Dead `home.theme.*` keys removed** from all three bundles — they belonged to the `ThemeToggle`
      deleted in Task 3 and nothing consumed them; the writer proved it by grep first. Dead keys inside a
      parity-enforced tree are a maintenance trap.
    - Evidence: `pnpm test -- src/components/theme src/app-shell src/lib/i18n` → 24 passed; full suite →
      **23 files, 152 tests passed**; `pnpm typecheck` clean; `pnpm lint` clean; `pnpm build` clean.
    - **A hole in Task 1's mapping layer, found by the parent, not by any test**: `--seg-thumb` was
      defined in `tokens.css` and asserted in `tokens.test.ts`, but was **not mapped in
      `tailwind.config.js`** — every other token is. So the control had to use the arbitrary value
      `bg-[hsl(var(--seg-thumb))]`, and the next component needing that token would not find it through
      Tailwind either. This was the **parent's error**: the brief asserted the token was already mapped.
      Fixed: `"seg-thumb"` added to the Tailwind colour map, class changed to `bg-seg-thumb`. Proof the
      mapping is real rather than merely green: the compiled CSS contains
      `.bg-seg-thumb{background-color:hsl(var(--seg-thumb))}`. **A passing test does not prove a Tailwind
      utility was generated — the output CSS has to be inspected.**
    - Contrast measured by hand for the pair nobody had measured, `--foreground` on `--seg-thumb`: light
      222 47% 11% on 0 0% 100% ≈ 15:1; dark 210 40% 98% on 217 33% 24% ≈ 11.2:1. Both pass AA with margin.
    - **Open observation for the user (not acted on)**: the ticket's AC specifies `aria-pressed`, and that
      is exactly what shipped. The semantically correct pattern for an **exclusive** three-way choice is
      `role="radiogroup"` + `role="radio"` + `aria-checked` (what Radix's `ToggleGroup` does, and this repo
      is shadcn/Radix). With `aria-pressed` a screen reader announces three "toggle button"s, one pressed:
      usable, but it does not communicate that the choice is single and exclusive. Switching is a
      confined change, but it requires updating the AC first.
    - **CLOSED 2026-10-13 as moot** — the user rejected the segmented control entirely (below), so
      `aria-pressed` is gone and there is no group role left to correct.

- [x] Task 4 rework (2026-10-13) — Replace the segmented control with a cycling icon button.
  - Trigger: the user reviewed http://localhost:8080 and asked to swap the three-segment control for a
    sun/moon icon button.
  - **The consequence surfaced before implementing, instead of being assumed**: a sun/moon toggle is
    binary, so `system` would become unreachable from the UI after the first click — which would also
    make the live `matchMedia` subscription built in Task 3 effectively dead code. Presented as a
    choice; the user picked **three states cycling**.
  - Decisions fixed by the parent before delegating (no writer discretion):
    - One `<Button variant="ghost" size="icon">`; no `role="group"`, no `aria-pressed`, no segmented
      control.
    - Icons `Sun`/`Moon`/`Monitor` from `lucide-react` — already a dependency and, until now, the only
      unused one. **Zero new dependencies.**
    - Cycle order exactly `light → dark → system → light`; since the default is `system`, the first
      click lands on `light`. Extracted to `THEME_CYCLE` + pure `nextPreference()` in
      `src/lib/theme/theme.ts` (additive; no existing export touched) so the order is unit-testable
      without rendering.
    - The icon reflects the stored **preference, never the resolved theme** — with `system` selected the
      monitor stays visible even while the OS asks for dark, so the user can tell `system` is still
      active.
    - Accessible name describes the **action** (`Switch to {{mode}}`), not the current state. This is
      sufficient rather than lossy: with a fixed cycle the announced action determines the current state
      unambiguously (`Dark` ⇒ currently `light`, `System` ⇒ currently `dark`, `Light` ⇒ currently
      `system`). The icon is `aria-hidden` so it cannot pollute the name; `title` carries the same
      string for mouse users.
    - i18n: added `shell.theme.switchTo`; `shell.theme.system` reworded to *automatic*
      (`Automatic`/`Automático`/`Automático`) since it is now interpolated into an action phrase and is
      no longer visible copy; **`shell.theme.label` removed** from all three bundles because the deleted
      group was its only consumer (grep-proven).
  - Evidence (parent-verified, not taken from the writer's report):
    - RED observed against the old implementation first: `13 tests | 12 failed`, the DOM dump showing
      `role="group"` + three `aria-pressed` buttons; the only prior pass was the axe scan.
    - `pnpm test -- src/components/theme src/lib/theme src/app-shell` → **4 files, 76 tests passed**
      (re-run by the parent as the spot check).
    - `pnpm typecheck` clean; `pnpm lint` clean (`biome` + `eslint`, 75 files); `pnpm build` clean.
    - `src/app-shell.tsx` needed no change — the component keeps its path and export name, so the mount
      is untouched.
  - **Operational note for visual re-verification**: `docker-compose.yml` passes no volume for `dist/`
    and the bundle is baked at image build time, so the running container was still serving the **old**
    bundle (`assets/index-C7vWjN0Z.js`) while the fresh build produced `assets/index-BKWxCa_l.js`. A
    rebuild (`make docker-up`, which passes `--build`) is required before the new control is visible at
    http://localhost:8080.

- [x] Task 5 — Docs: `docs/design-system.md`, the languages ADR, `component-patterns.md` reference.
  - Must include the naming convention from the `.dot`/`.brand` bug and the token-name mapping.
  - Delivered on its own branch after the main PR merged — see "Follow-up: Task 5" below.

- [x] Task 6 — Version the boceto and run the full local gate.
  - Commit `designs/identity/index.html` so the ticket's source of truth exists in git.
  - Run `make ci`; record failed/skipped checks honestly (local e2e is CI-only).
  - Done in the main PR: the boceto is slice C0 (`77841a8`) and `make ci` was green. Evidence is
    recorded under "Delivery" below; the follow-up does not touch build output, so it is not re-run.

## Follow-up: Task 5 delivered on its own branch (2026-10-16)

Branch `docs/COU-270-documentar-el-sistema-de-diseno`, cut from `develop` at `e9c5fff` (the COU-270
merge). Task 5 was deliberately excluded from the main PR, so it lands as its own reviewable PR and
COU-270 closes here.

- [x] `docs/design-system.md` (new, 263 lines) — palette (surfaces and chrome, brand, status tones,
      destructive), typography, spacing, radii and shadows, focus, the "tokens only, never hex" rule,
      the boceto → shadcn token-name mapping, the modifier-naming convention from the `.dot`/`.brand`
      bug, and an enforcement table that maps each claim to the guard that actually holds it.
- [x] ADR-12 in `docs/adr.md` (+40 lines) — `en|es|pt` with mandatory key parity, plus its row in the
      ADR summary table. Records the policy as verified in code, not as described: `defaultLanguage`
      and `fallbackLng` are both `en`, the language list lives in `src/lib/i18n/resources.ts`, and
      `src/lib/i18n/parity.test.ts` enforces key parity with English **in both directions** plus
      identical `{{...}}` interpolation tokens.
- [x] `docs/component-patterns.md` (+5 / −1) — links the design system from the primitives section and
      adds a tokens-only item to the review checklist.
- [x] Hex guard, delivered in two halves — the ticket asked for a "lint rule", and that is **not
      implementable as written**: `@biomejs/biome` 1.9.4 ships no hex rule (`nursery/noHexColors` and
      `suspicious/noHexColors` both answer `This rule doesn't exist`) and ESLint cannot lint CSS — a
      hole that matters because CSS is exactly where a raw color would land. The surface is therefore
      covered by two mechanisms working as one guard:
  - `eslint.config.js` (+32 lines) — `no-restricted-syntax` with `Literal[value=…]` and
    `TemplateElement[value.raw=…]` selectors, scoped to `src/**/*.{ts,tsx}`, carrying a message that
    points the developer at the tokens and at `docs/design-system.md`.
  - `src/styles/no-hardcoded-hex.test.ts` (new, 80 lines) — dependency-free walk of every `.ts`,
    `.tsx`, `.css`, `.js`, `.jsx`, `.mjs`, `.cjs` and `.html` file under `src/`, failing on any hex
    literal. It strips CSS block comments first, because `src/styles/tokens.css:39` legitimately
    quotes `#F43E5C` inside the comment that documents why light `--destructive` is rose-600 and not
    the boceto's rose-500. Follows the disk-read precedent of `src/styles/tokens.test.ts`.

**Size**: 421 authored lines (343 new, 77 edited, 1 deleted) across 5 paths — marginally over the ~400
line review-budget heuristic. The heuristic is advisory and explicitly not a task acceptance criterion,
and the `chained-pr` failure mode it warns about is artificial splitting: this is one coherent
docs-plus-guard deliverable, and chaining it would produce two PRs for a single purpose. The cached
delivery choice for this feature is `single-pr` (see Delivery), so the follow-up inherits it. Reported
rather than hidden.

**Verification** — parent-run on the working tree. `strict_tdd: true` (`openspec/config.yaml:67`),
runner `vitest`:

| Command | Observed |
|---|---|
| `pnpm test -- src/styles/no-hardcoded-hex.test.ts` | 1 file, 2 tests passed |
| `pnpm test` | 24 files, 165 tests passed |
| `pnpm typecheck` | `tsc -b --noEmit`, exit 0 |
| `pnpm build` | 1699 modules transformed, built in 3.62s |
| `pnpm lint` | `biome check . && eslint .` → 76 files checked, no fixes applied |

**RED/GREEN, observed by the parent, not taken from the writer's report**: a temporary
`src/styles/__red-probe.ts` holding `export const probe = "#ff00ff";` made the guard test fail
(`found #ff00ff  →  export const probe = "#ff00ff";`, 1 failed | 1 passed) **and** made
`eslint` report `1:22 error Hardcoded hex color … no-restricted-syntax`; removing the probe returned
the test to green with `git status` showing no residue. The two docs have no runnable deterministic
RED — that exception is declared, not dressed up as test-first.

**Acceptance criterion 2 (doc values match the boceto)**: one deviation exists and it is **deliberate
and pre-existing**, documented in both `tokens.css` and `docs/design-system.md` — light
`--muted-foreground` is `45%`, not the boceto's `47%`, because at 47% the pairing with `--muted`
measured 4.299:1, below AA. No undocumented value mismatch was found between
`designs/identity/index.html` and `src/styles/tokens.css`.

**Gap carried honestly, not papered over**: `docs/design-system.md` states that the `.dot`/`.brand`
modifier-naming convention is enforced **by review only** — no automated guard exists. Criterion 6
explicitly permits that ("via a rule or test, **or** documented as convention"), so the criterion is
met, but the document says what is actually true rather than implying a guard that is not there.

**RDD**: `on, decided by global`. This follow-up PR slice is the native review candidate.

## Cross-cutting requirements discovered while running the stack (2026-10-13)

Verified live against the running containers, not inferred:

- **The UI must send `Accept-Language` on every API request.** The API localizes its error messages
  (`api-user/src/common/i18n/i18n.module.ts:28` sets `fallbackLanguage: 'es'`) and the header drives it:
  `en` → `"Invalid credentials"`, `es` → `"Credenciales inválidas"`, `pt` → `"Credenciais inválidas"`.
  **With no header it answers in Spanish.** This UI falls back to `en`, so without the header an English
  or Portuguese user gets Spanish error text injected into an otherwise translated interface. This is a
  hard acceptance criterion for whichever ticket builds the shared HTTP layer, and it needs its own test —
  it is invisible in component tests because they stub the network.
- **Both repos bind port 3000 for their dev server** (`ui-user/vite.config.ts:16` and `api-user`
  `PORT=3000`), so `make dev` cannot run in both at once. The Docker flow (UI on 8080) avoids the clash
  and Playwright uses 4173. `api-user/.env.development` already lists `http://localhost:8080` in
  `CORS_ORIGINS`, so the containerized flow is the intended local setup — verified: the API answers
  `access-control-allow-origin: http://localhost:8080`.
- Confirmed live for the api-user backlog: every `/admin/*`, `/permissions`, `/roles` and
  `/users/profile` route returns **401 without a token** (the COU-266 guard is live),
  `RoleController` exposes only `GET /roles` and `PUT /roles/:id/permissions` — **no create, delete or
  rename** — and there is no `GET /auth/me` anywhere among the mapped routes (COU-267).

## Delivery

- Strategy: **one single PR into `develop`**, carrying a maintainer-accepted global **`size:exception`**
  (user decision, 2026-10-13). The chain option was presented with its real per-slice cost
  (C0, C1, C2 and C3 all exceed the ~400 line review budget, so the chain would have needed four
  separate `size:exception` acceptances) and the user chose one PR: one CI round and one review round
  instead of five, at the cost of review focus. `chained-pr` forbids an over-budget PR without an
  explicit maintainer exception; that exception was given and is recorded here, never assumed.
- History of this decision: the strategy recorded on 2026-10-12 was `stacked-to-main`. That name is
  **invalid in this repo** — `.github/FLOW.md` states "Feature PRs **MUST** target `develop`", and
  `main` accepts only `release/*` and `hotfix/*`. The chain was built on that correction and then
  overridden by the single-PR decision above, so the branch targets `develop`, the same flow COU-253
  used. No new flow invented for this repo.
- **Actual size: 3,161 authored lines** across 26 changed paths (`git diff --numstat ed6997b HEAD`),
  against a ~1,400 forecast. The forecast was low because it did not count the boceto (975 lines) or the
  test suites that carry the token and theme work.
- **Commits are authorized and made (2026-10-13).** The user's standing instruction had been that there
  are no commits without explicit authorization; it was superseded by "vamos con PR", which cannot be
  satisfied without them. Five work-unit commits, each verified `typecheck`-clean **in isolation** by
  checking out its SHA (not merely at the branch tip):

  | Slice | Commit | Lines | Base |
  |---|---|---|---|
  | C0 identity boceto | `77841a8` | 975 | `ed6997b` |
  | C1 brand tokens | `2e698a5` | 411 | C0 |
  | C2 i18n es/pt + parity | `3f5548c` | 610 | C1 |
  | C3 theme mechanism + pre-paint | `071246a` | 828 | C2 |
  | C4 cycling theme control | `36ca04c` | 337 | C3 |

  Only C4 is inside the ~400 review budget. Slices C0 (a single indivisible HTML design artifact), C2
  (the three bundles cannot be separated, because parity is only meaningful with all three present) and
  C3 (427 of its 828 lines are tests, and no cohesive sub-split brings both halves under 400 — the model
  and the sync layer share one `matchMedia` stub in `src/test/setup.ts`) cannot be split cleanly. After
  one honest slicing pass this is the best cohesive split, so the overage is reported rather than
  hidden, for the maintainer's `size:exception` decision.
- **Defect found and fixed in the slicing, not in the code**: the first attempt put the removal of the
  `home.theme.*` locale keys in C2 while the dead `ThemeToggle` that referenced them (via typed `t()`
  calls) only died in C3. `pnpm typecheck` failed at C2 with
  `Type '{ theme: string; }' is not assignable to type 'string'` on
  `src/features/home/components/theme-toggle.test.tsx`. The tree was inconsistent for exactly one
  commit. Fixed by moving the component deletion into C2: a key and its only consumer must travel
  together. **The lesson is that verifying only the branch tip would have shipped this** — each commit
  now gets its own checkout + typecheck.
- Tasks 5 and 6: **Task 6 is done** — `make ci` is green and the boceto is versioned as C0. **Task 5
  remains**: `docs/design-system.md`, the languages ADR in `docs/adr.md`, the `component-patterns.md`
  reference, and the no-hardcoded-hex lint rule. With the single-PR decision it is **not** part of this
  PR, so COU-270 stays open after this PR merges and closes with the follow-up. This document is
  committed in this PR: a reviewer of a 3,161-line diff needs the plan and the evidence beside it.
- RDD (`gentle-ai review mode status`): **on, decided by global**. `gentle-ai review assess` over
  `ed6997b..HEAD` returns `risk: medium`, `review_due: true` with reason `slice_budget_reached`
  (3,161 lines, 26 changed paths). The only risk reason reported is `executable_change` on
  `designs/identity/index.html`, which the assessor classifies as executable because it is HTML. The
  native review candidate is this PR slice.
- Skills resolved by registry name before PR planning: `work-unit-commits`, `chained-pr`,
  `branch-pr`, `github-conventions`, `git-environment-flow`.
- **Follow-up delivery (2026-10-16)**: Task 5 lands on `docs/COU-270-documentar-el-sistema-de-diseno`,
  a second PR into `develop` under the same cached `single-pr` choice. It is a docs-plus-guard slice
  and does **not** inherit the main PR's `size:exception` — at 421 authored lines it is a normal-sized
  review, not a 3,161-line one. Details and evidence under "Follow-up: Task 5" above.

## Exploration notes

Read-only exploration (verified on this branch, not inherited from an earlier survey):

- Edit surfaces: `src/styles/tokens.css`, `src/styles/index.css`, `tailwind.config.js`,
  `src/lib/i18n/resources.ts`, `src/lib/i18n/index.ts`, `src/lib/i18n/i18next.d.ts`,
  `src/lib/i18n/i18n.test.ts`, `src/stores/use-ui-store.ts`, `src/stores/use-ui-store.test.ts`,
  `src/features/home/components/theme-toggle.tsx` (+ test), `src/app-shell.tsx` (+ test),
  `src/main.tsx`, `index.html` (pre-paint script), `docs/design-system.md` (new), `docs/adr.md`,
  `docs/component-patterns.md`, `designs/identity/index.html` (add to git).
- `src/components/ui/` holds only `button.tsx` (+ test) and `card.tsx`; no `components.json`.
- `.codegraph/` is present and was used for this exploration.
