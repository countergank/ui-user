# Design System

> Why: the console's look comes from exactly one place — the tokens in
> `src/styles/tokens.css`. Components consume those tokens by name; no component owns a
> color. This doc is the contract later UI tickets inherit: where the values come from, the
> naming rules that keep the CSS honest, and the checks that keep it true.

The **source of truth for the values** is `src/styles/tokens.css`, exposed to components
through `tailwind.config.js`. Tokens are bare HSL channels (`306 54% 35%`) consumed as
`hsl(var(--primary))` so opacity works everywhere. Nothing in `design/` overrides a value: the
folder is the **inventory** (what is, what is proposed), never the source.

| Where | Role |
|-------|------|
| `src/styles/tokens.css` | The values the app renders — the only source of truth |
| `tailwind.config.js` | Token → Tailwind utility map |
| `design/system.md` | The same values, described with their component rules |
| `design/app/tokens-app.css` | Light half of the applied palette, imported into `tokens.css` by COU-344 |
| `design/app/tokens-dark.css` | Dark half of the applied palette (Radix base: mauve/plum/grass/amber/red/blue) |
| `design/README.md` | Index of `design/`: what is current, what is proposed |

If `design/` and `tokens.css` ever disagree, `tokens.css` wins and `design/` has a defect.

- The canonical landing is the **implemented one** (`src/features/landing/`), aligned to
  artboard `01-landing.html`.
- The old `Resumen` nav entry is removed; `Inicio` is the first entry and points at `/app`.
- Artboards: `04-usuarios` replaces `04-resumen` (re-export pending); `Crear usuario` and
  `Editar usuario` were built directly in the `.fig` (HTML export pending).

## Quick path

1. Pick the token that names the **intent** (`--primary`, `--muted-foreground`, `--success`).
2. Use it through a Tailwind utility: `bg-primary`, `text-muted-foreground`, `border-success/30`.
3. When no utility exists, use `hsl(var(--token))` — never a hex, never an `rgb()` literal.
4. Verify with `pnpm test` (contrast + hex guard) and `pnpm lint` (hex guard).

## Tokens only, never hex

**Rule: application code never contains a hex color.** The only hex allowed is inside a
`tokens.css` comment that documents a contrast rationale. Everything else refers to a token
by name.

Why it matters: a hex in a component is invisible to dark mode and to a future rebrand.
Changing `--primary` re-themes every screen; a stray `#7C3AED` in a component survives the
change and breaks the theme silently.

Enforced by:

| Surface | Guard |
|---------|-------|
| `.ts` / `.tsx` under `src/` | `no-restricted-syntax` in `eslint.config.js` (`pnpm lint`) |
| every text file under `src/` (incl. `.css`) | `src/styles/no-hardcoded-hex.test.ts` (`pnpm test`) |

The two live in different tools on purpose: **Biome 1.9.4 ships no hex-color rule**
(`nursery/noHexColors` and `suspicious/noHexColors` both report "This rule doesn't exist") and
**ESLint cannot lint CSS**, so each tool covers the half the other cannot. The disk-scan
test strips CSS comments, because a comment cannot render a color.

## Adding a token

**Any change to `tailwind.config.js` — a new token or a new key — requires restarting the
Vite dev server.** Tailwind generates utilities at startup, so HMR does not pick new keys up:
the classes silently do not exist. This bit the team three times during COU-344.

## Palette

Semantic tokens, both modes. Values are bare HSL channels; each maps to a Tailwind color
(`bg-background`, `text-foreground`, `border-border`, …). The palette was applied by COU-344
from `design/app/tokens-app.css` + `tokens-dark.css`; the previous violet brand
(`262 83% 58%`) is gone.

### Surfaces and chrome

| Token | Light | Dark | Use |
|-------|-------|------|-----|
| `--background` | `0 0% 100%` | `270 6% 7%` | Page surface |
| `--foreground` | `240 8% 7%` | `240 6% 94%` | Primary text |
| `--card` / `--card-foreground` | `0 0% 100%` / `240 8% 7%` | `270 4% 10%` / `240 6% 94%` | Generic panels, cards, inputs |
| `--popover` / `--popover-foreground` | `0 0% 100%` / `240 8% 7%` | `260 4% 14%` / `240 6% 94%` | Elevation |
| `--muted` | `240 22% 96%` | `260 4% 14%` | Subtle surfaces, table headers |
| `--muted-foreground` | `240 6% 36%` | `258 7% 72%` | Secondary text |
| `--secondary` | `240 22% 96%` | `260 4% 14%` | Secondary surface |
| `--secondary-foreground` | `240 8% 7%` | `240 6% 94%` | Text on a secondary surface |
| `--border` | `240 14% 93%` | `270 5% 24%` | Dividers, outlines |
| `--input` | `240 13% 88%` | `270 5% 24%` | Form-control outline |
| `--canvas` | `240 20% 98%` (`#F9F9FB`) | `270 4.7% 16.9%` (`#2B292D`) | Console screen background, behind every panel |
| `--panel` | `0 0% 100%` (`#FFFFFF`) | `240 8.1% 7.3%` (`#111114`) | The console card surface: user-detail cards, users-list KPI cards, table card, side cards |
| `--panel-foreground` / `--panel-muted` / `--panel-subtle` / `--panel-faint` | `240 8% 7%` / `240 5% 45%` / `240 6% 36%` / `240 5% 57%` | `240 6% 94%` / `240 12% 85%` / `240 7% 68%` / `240 5% 57%` | Text hierarchy on a panel |
| `--panel-accent` / `--panel-border` | `306 54% 35%` / `240 14% 93%` | `281 46% 75%` / `270 5% 24%` | Panel accent and border |
| `--avatar` / `--avatar-ring` | `276 42% 95%` (`#F3EDF8`) / `306 54% 35%` (`#892980`) | `297 42% 20%` (`#461E48`) / `291.7 48.2% 56.1%` (`#B659C5`) | Topbar user button and its ring |
| `--avatar-1-bg`…`--avatar-6-bg` + `--avatar-2-fg`…`--avatar-4-fg` | six backgrounds, three texts | theme-aware | Initials palette across the app |
| `--surface-raised` | `240 25% 98%` | `270 5% 17%` | Raised surface (`bg-surface-raised`) |
| `--surface-row-alt` | `240 20% 99%` | `270 4% 10%` | Alternating table row (`bg-surface-row-alt`) |
| `--sidebar` family | `240 8% 7%` / `240 6% 94%` / `270 5% 17%` / `270 17% 14%` | `260 4% 14%` / `240 6% 94%` / `270 5% 24%` / `300 34% 15%` | Console rail and login brand-panel chrome (`sidebar`, `-foreground`, `-border`, `-accent`, plus `-highlight/muted/subtle/faint`) |

`surface.raised` and `surface.row-alt` have Tailwind keys (`bg-surface-raised`,
`bg-surface-row-alt`) — no more arbitrary `bg-[hsl(var(--surface-raised))]`. Contrast
pairings are asserted in `src/styles/tokens.test.ts`.

### Brand

| Token | Light | Dark | Use |
|-------|-------|------|-----|
| `--primary` | `306 54% 35%` (`#892980`) | `292 48% 56%` | Primary action, active nav |
| `--primary-foreground` | `0 0% 100%` | `291 39% 6%` | Text on `--primary` |
| `--primary-hover` | `306 54% 35%` | `293 47% 63%` | Primary hover |
| `--primary-soft` / `--accent` | `276 42% 95%` | `297 42% 20%` | Highlight surface (brand tint) |
| `--accent-foreground` | `306 54% 35%` | `292 79% 77%` | Text on `--accent` |
| `--ring` | `306 54% 35%` | `292 30% 47%` | Focus ring (see [Focus](#focus)) |
| `--accent-violet` / `--accent-plum` | `281 46% 75%` / `262 35% 47%` | `296 34% 28%` / `294 31% 36%` | Decorative brand accents |

The brand hue is the magenta/plum of the Countergank identity, not the old violet. The dark
scale is built on Radix `plum`; the light primary (`306 54% 35%`) is the AA-safe step. In
light mode `--primary-hover` equals `--primary` — that is how the design file defines it, a
recorded decision, not a defect.

### Status tones

Four tones, each with a `-foreground` pair. The bare tone is for dots, borders and icon
fills; the `-foreground` is the AA-safe text color on a tint of the tone (asserted in
`src/styles/tokens.test.ts`, over both `--background` and `--card`).

| Token pair | Light | Dark |
|------------|-------|------|
| `--success` / `--success-foreground` | `151 61% 30%` / `151 61% 29%` | `151 55% 42%` / `151 65% 54%` |
| `--warning` / `--warning-foreground` | `39 100% 27%` / `39 100% 27%` | `39 100% 57%` / `46 100% 54%` |
| `--danger` / `--danger-foreground` | `3 71% 41%` / `3 71% 41%` | `358 45% 49%` / `2 100% 79%` |
| `--info` / `--info-foreground` | `209 100% 50%` / `208 88% 40%` | `206 100% 50%` / `210 100% 72%` |
| `--success-soft` / `--danger-soft` | `141 41% 93%` / `3 69% 95%` | `152 41% 13%` / `350 53% 15%` |

Usage in Tailwind: `text-success-foreground`, `bg-success/14`, `border-success/30`. On the
users table, status is a dot + text: `text-success` active, `text-muted-foreground` inactive,
`text-destructive` locked (`lockedUntil` overrides `isActive`). The KPI percentages, role
distribution counts, audit rows and the verification column are placeholders (`—`) awaiting
`api-user` work tracked in COU-347 — not real features.

### Destructive

`--destructive` is the shadcn button background, separate in role from the `--danger` **status
tone** (in value they coincide in both modes; the foregrounds differ):

| Token | Light | Dark |
|-------|-------|------|
| `--destructive` | `3 71% 41%` | `358 45% 49%` |
| `--destructive-foreground` | `0 0% 100%` | `0 0% 100%` |

White text on both steps is asserted by `src/styles/tokens.test.ts`.

## Token-name mapping (COU-270 boceto → app)

The app keeps shadcn/ui variable names because existing components and `tailwind.config.js`
consume them. The original brand boceto's names are mapped at the port, so **no class name
changes** — and the mapping is written down here so the rename cannot recur silently.

The boceto itself (`designs/identity/index.html`) was retired in COU-345: it duplicated this
system as a second, contradictory source. The tables below are the durable record of the
mapping it defined.

| Boceto | App (shadcn) | Note |
|--------|--------------|------|
| `--bg` | `--background` | rename |
| `--fg` | `--foreground` | rename |
| `--card-fg` | `--card-foreground` | rename |
| `--primary-fg` | `--primary-foreground` | rename |
| `--muted-fg` | `--muted-foreground` | rename |
| `--accent-fg` | `--accent-foreground` | rename |
| `--card`, `--muted`, `--border`, `--input`, `--ring` | same | unchanged |
| `--primary`, `--primary-hover`, `--accent`, `--seg-thumb` | same | unchanged |
| `--danger` (as button background) | `--destructive` | renamed + AA value change |
| `--danger` (as status tone) | `--danger` | kept, plus `--danger-foreground` |

Tokens the boceto does **not** define, derived without inventing hues:
`--popover` (= `--card`), `--popover-foreground` (= `--foreground`), `--secondary`
(= `--muted`), `--secondary-foreground` (= `--foreground`), `--destructive-foreground`, and
every `--{success,warning,danger,info}-foreground`. This table is the durable explanation;
the COU-344 palette replaced the boceto's values.

## Typography

Three self-hosted families:

| Token | Family | Use |
|-------|--------|-----|
| `--font-sans` | Inter | All UI |
| `--font-display` | Space Grotesk (weight axis 300–700) | Page titles |
| `--font-mono` | JetBrains Mono | Identifiers, the wordmark, column headers |

| Role | Pattern | Notes |
|------|---------|-------|
| Page title | `font-display text-[26px] font-bold` | |
| Column header | mono 11px, uppercase, `tracking-[0.16em]` | |
| Body | `text-sm` | |
| Secondary | `text-muted-foreground` | |
| Technical data | `font-mono` | IDs, `user:update` |

Tailwind utilities: `font-sans`, `font-display`, `font-mono`. The body applies
`font-feature-settings: "rlig" 1, "calt" 1` in `src/styles/index.css`.

## Spacing

A strict **4px grid**: 4, 8, 12, 16, 24, 32, 48. Tailwind's default spacing scale is the
same 4px grid (`p-1` = 4px, `p-2` = 8px, `gap-4` = 16px, …). Use the scale; never hand-write
a `px` padding.

## Radii and shadows

Radii come from three tokens (mode-independent, defined once in `:root`):

| Token | Value | px | Tailwind |
|-------|-------|----|----------|
| `--radius-sm` | `0.375rem` | 6px | `rounded-sm` |
| `calc(var(--radius) - 2px)` | | 6px | `rounded-md` |
| `--radius` | `0.5rem` | 8px | `rounded` (DEFAULT) |
| `--radius-lg` | `0.75rem` | 12px | `rounded-lg` |
| — | `999px` | pill | `rounded-full` |

Shadows stay minimal — in a console the relief comes from the border, not the shadow. They
are per-mode (a dark surface needs a darker shadow):

| Token | Light | Dark | Use |
|-------|-------|------|-----|
| `--shadow-sm` | 5% slate | 40% black | Resting |
| `--shadow` | 8% slate | 50% black | Card |
| `--shadow-lg` | 14% slate | 60% black | Overlay |

Tailwind: `shadow-sm`, `shadow`, `shadow-lg`.

## Focus

`--ring` is the focus color: light `306 54% 35%`, dark `292 30% 47%`. Focus must be visible
on every interactive element — this is a WCAG 2.2 requirement, not decoration.

- Buttons and links: `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`
  (see `src/components/ui/button.tsx`). The ring shows on keyboard focus only.
- Fields: `border-color: hsl(var(--ring))` plus a `box-shadow: 0 0 0 3px hsl(var(--ring) / .18)`.
- Never remove an outline without an equivalent visible replacement; `eslint-plugin-jsx-a11y`
  (strict) and `vitest-axe` enforce the baseline.
- Native UI (scrollbars, selects, autofill) follows the theme through `color-scheme: light` /
  `dark`, declared per mode in `src/styles/index.css`.

## Naming: modifiers must not collide with standalone classes

A CSS modifier's suffix token **must not be a word that already exists as a standalone class
name.** The bug that wrote this rule: `.dot` (a color-swatch utility with `width: 14px;
margin-right: 8px`) and `.brand` already existed as standalone classes, and a
`.badge.dot` modifier reused the word `dot`. At equal specificity the earlier `.dot` utility's
properties leaked into the badge, so any badge carrying it became 14px wide and its text
overflowed.

Convention, from the retired COU-270 boceto's own comments:

- **Flags unique to one component are namespaced** with `block--flag`: `.badge--dot`, not
  `.badge.dot`.
- **Tone words shared across components stay flat**: `.badge.ok`, `.alert.ok` — a deliberate
  shared vocabulary.
- Never the reverse: do not reuse a standalone class name (`dot`, `brand`, …) as a modifier.

**What enforces this today: nothing automated.** It is a review convention. It still applies
to any hand-written CSS added under `src/styles/`; component styling otherwise goes through
shadcn/Tailwind utilities, which keep this whole bug class out of reach.

## Localization

User-facing copy is localized in `en`, `es`, and `pt` with mandatory key parity. That policy
and its enforcement are fixed by
[ADR-12](adr.md#adr-12-supported-languages-and-mandatory-key-parity),
not by this design system — but every string a component renders must come from the
translation bundles, never be hardcoded.

## How it is enforced

| Claim | Guard | Where |
|-------|-------|-------|
| Status tones and destructive text pass AA in both modes | measured contrast | `src/styles/tokens.test.ts` |
| `--muted-foreground` passes on `--muted`, `--background`, `--card` | measured contrast | `src/styles/tokens.test.ts` |
| Every tone variable is mapped in Tailwind | token/config parity | `src/styles/tokens.test.ts` |
| No hex in `.ts` / `.tsx` | `no-restricted-syntax` | `eslint.config.js` (`pnpm lint`) |
| No hex anywhere under `src/` (CSS comments exempt) | disk scan | `src/styles/no-hardcoded-hex.test.ts` |
| `en`/`es`/`pt` key parity | parity test + type system | `src/lib/i18n/parity.test.ts` (ADR-12) |
| New Tailwind color keys exist at runtime | restart the dev server after editing `tailwind.config.js` | process rule |

## Rule of thumb checklist

- [ ] Color comes from a token (`bg-primary`, `hsl(var(--success))`) — never a hex
- [ ] A new state/tone has a light **and** dark value, and its AA pair is measured
- [ ] A new token is added to both `tokens.css` blocks **and** `tailwind.config.js`
- [ ] After editing `tailwind.config.js`, the Vite dev server is restarted (HMR does not pick up new keys)
- [ ] Spacing uses the 4px scale; radii/shadows use the tokens
- [ ] Focus stays visible on every interactive element
- [ ] A CSS modifier's suffix is not an existing standalone class name (namespace with `--`)
- [ ] Rendered strings come from the translation bundles (ADR-12)
