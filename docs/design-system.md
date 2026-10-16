# Design System

> Why: the console's look comes from exactly one place — the tokens in
> `src/styles/tokens.css`. Components consume those tokens by name; no component owns a
> color. This doc is the contract later UI tickets inherit: where the values come from, the
> naming rules that keep the CSS honest, and the checks that keep it true.

The **source of truth for the values** is `designs/identity/index.html` (the brand boceto,
versioned in git). The app port lives in `src/styles/tokens.css` and is exposed to
components through `tailwind.config.js`. Tokens are bare HSL channels
(`262 83% 58%`) consumed as `hsl(var(--primary))` so opacity works everywhere.

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
(`nursery/noHexColors` and `suspicious/noHexColors` both report "This rule doesn't exist")
and **ESLint cannot lint CSS**, so each tool covers the half the other cannot. The disk-scan
test strips CSS comments, because a comment cannot render a color.

## Palette

Semantic tokens, both modes. Values are bare HSL channels; each maps to a Tailwind color
(`bg-background`, `text-foreground`, `border-border`, …).

### Surfaces and chrome

| Token | Light | Dark | Use |
|-------|-------|------|-----|
| `--background` | `0 0% 100%` | `222 47% 9%` | Page surface |
| `--foreground` | `222 47% 11%` | `210 40% 98%` | Primary text |
| `--card` | `0 0% 100%` | `222 47% 13%` | Panels, cards, inputs |
| `--card-foreground` | `222 47% 11%` | `210 40% 98%` | Text on a card |
| `--popover` | `0 0% 100%` | `222 47% 13%` | Elevation (derived, = card) |
| `--popover-foreground` | `222 47% 11%` | `210 40% 98%` | Text in a popover |
| `--muted` | `210 40% 96%` | `217 33% 17%` | Subtle surfaces, table headers |
| `--muted-foreground` | `215 16% 45%` | `215 20% 65%` | Secondary text |
| `--secondary` | `210 40% 96%` | `217 33% 17%` | Secondary surface (derived, = muted) |
| `--secondary-foreground` | `222 47% 11%` | `210 40% 98%` | Text on a secondary surface |
| `--border` | `214 32% 91%` | `217 33% 20%` | Dividers, outlines |
| `--input` | `214 32% 91%` | `217 33% 20%` | Form-control outline |
| `--seg-thumb` | `0 0% 100%` | `217 33% 24%` | Selected segment thumb |

> **One deliberate deviation from the boceto**: light `--muted-foreground` is `45%`, not the
> boceto's `47%`. It is also the text color *on* `--muted` (neutral badges, disabled inputs,
> table headers); at 47% that pairing measured 4.299:1 — below AA. At 45% it measures 4.616:1
> on `--muted` and 5.066:1 on `--background`. `src/styles/tokens.test.ts` asserts all three
> pairings so the fix cannot regress.

### Brand

| Token | Light | Dark | Use |
|-------|-------|------|-----|
| `--primary` | `262 83% 58%` | `255 92% 76%` | Primary action, active nav |
| `--primary-foreground` | `0 0% 100%` | `222 47% 9%` | Text on `--primary` |
| `--primary-hover` | `263 70% 50%` | `258 90% 66%` | Primary hover |
| `--accent` | `251 100% 96%` | `263 69% 20%` | Highlight surface (brand tint) |
| `--accent-foreground` | `262 83% 58%` | `255 92% 76%` | Text on `--accent` |
| `--ring` | `262 83% 58%` | `255 92% 76%` | Focus ring (see [Focus](#focus)) |

The brand hue is the violet of the real Countergank logo: violet-500 (`#8B5CF6`). The
semantic tokens pick the ramp step that passes AA — light `--primary` is violet-600
(`#7C3AED`, `262 83% 58%`) and dark `--primary` is violet-400 (`#A78BFA`, `255 92% 76%`).
The brand ramp is the reference palette, **not** exposed as tokens — the app consumes only
the semantic values above:

| Step | 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950 |
|------|----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|
| Violet | `#F5F3FF` | `#EDE9FE` | `#DDD6FE` | `#C4B5FD` | `#A78BFA` | `#8B5CF6` | `#7C3AED` | `#6D28D9` | `#5B21B6` | `#4C1D95` | `#2E1065` |
| Slate (neutral) | `#F8FAFC` | `#F1F5F9` | `#E2E8F0` | `#CBD5E1` | `#94A3B8` | `#64748B` | `#475569` | `#334155` | `#1E293B` | `#0F172A` | `#020617` |

The step matters for contrast, not taste: violet-500 reaches only 3.6:1 on white, so the
light primary steps up to violet-600 (5.7:1, AA for button text); in dark mode the primary
lightens and its foreground inverts to near-black instead.

### Status tones

Four tones, each with a `-foreground` pair. The bare tone is for dots, borders, icon fills
and — in dark mode — text on a shaded surface. In **light** mode a tone used as *text* on a
tint of itself fails AA (measured 1.92:1 warning, 2.27:1 success, 2.47:1 info, 3.07:1
danger), so each tone ships a darker `-foreground` that is the AA-safe text color.

| Token pair | Light | Dark |
|------------|-------|------|
| `--success` / `--success-foreground` | `160 84% 39%` / `160 84% 25%` | `160 84% 45%` / `160 84% 45%` |
| `--warning` / `--warning-foreground` | `38 92% 50%` / `38 92% 29%` | `43 96% 56%` / `43 96% 56%` |
| `--danger` / `--danger-foreground` | `350 89% 60%` / `350 89% 42%` | `350 89% 65%` / `350 89% 66%` |
| `--info` / `--info-foreground` | `199 89% 48%` / `199 89% 33%` | `199 89% 60%` / `199 89% 60%` |

In dark mode `-foreground` reuses the tone: a light tone on a dark surface already clears AA.
Usage in Tailwind: `text-success-foreground`, `bg-success/14`, `border-success/30`.

### Destructive

`--destructive` is the shadcn button background, separate from the `--danger` **status tone**:

| Token | Light | Dark |
|-------|-------|------|
| `--destructive` | `347 77% 50%` | `350 89% 65%` |
| `--destructive-foreground` | `0 0% 100%` | `222 47% 9%` |

Light `--destructive` is rose-600, not the boceto's `--danger` rose-500 (`#F43E5C`): the
button paints it as a **background** under white text, where rose-500 reaches only 3.69:1.
rose-600 reaches 4.67:1 and passes AA.

## Token-name mapping (boceto → app)

The app keeps shadcn/ui variable names because existing components and `tailwind.config.js`
consume them. The boceto's names are mapped at the port, so **no class name changes** — and
the mapping is written down here so the rename cannot recur silently.

| Boceto | App (shadcn) | Note |
|--------|--------------|------|
| `--bg` | `--background` | rename |
| `--fg` | `--foreground` | rename |
| `--card-fg` | `--card-foreground` | rename |
| `--primary-fg` | `--primary-foreground` | rename |
| `--muted-fg` | `--muted-foreground` | rename, plus the AA value fix above |
| `--accent-fg` | `--accent-foreground` | rename |
| `--card`, `--muted`, `--border`, `--input`, `--ring` | same | unchanged |
| `--primary`, `--primary-hover`, `--accent`, `--seg-thumb` | same | unchanged |
| `--danger` (as button background) | `--destructive` | renamed + AA value change |
| `--danger` (as status tone) | `--danger` | kept, plus `--danger-foreground` |

Tokens the boceto does **not** define, derived without inventing hues:
`--popover` (= `--card`), `--popover-foreground` (= `--foreground`), `--secondary`
(= `--muted`), `--secondary-foreground` (= `--foreground`), `--destructive-foreground`, and
every `--{success,warning,danger,info}-foreground`.

The local copy of this mapping lives in the `tokens.css` header comment; this table is the
durable explanation.

## Typography

One family: **Inter** (variable, free, sober). The boceto's ramp:

| Role | Size / weight | Notes |
|------|---------------|-------|
| KPI metric | 26px / 650 | `tabular-nums` so columns don't jitter |
| Page title | 20px / 650 | |
| Section title | 15px / 650 | |
| Body | 14px / 400 | |
| UI / controls | 13px / 500 | Buttons, inputs |
| Secondary | 12.5px / 400 | `--muted-foreground` |
| Label | 10.5px / 600 | uppercase, `letter-spacing: .06em` |
| Technical data | 11px mono | IDs, `user:update` |

Tokens: `--font-sans` (`"Inter var", Inter, ui-sans-serif, system-ui, …`) and `--font-mono`.
Tailwind utilities: `font-sans`, `font-mono`. The body applies `font-feature-settings:
"rlig" 1, "calt" 1` in `src/styles/index.css`.

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

`--ring` is the focus color: light `262 83% 58%`, dark `255 92% 76%`. Focus must be visible
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

Convention, from the boceto's own comments:

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

## Rule of thumb checklist

- [ ] Color comes from a token (`bg-primary`, `hsl(var(--success))`) — never a hex
- [ ] A new state/tone has a light **and** dark value, and its AA pair is measured
- [ ] A new token is added to both `tokens.css` blocks **and** `tailwind.config.js`
- [ ] Spacing uses the 4px scale; radii/shadows use the tokens
- [ ] Focus stays visible on every interactive element
- [ ] A CSS modifier's suffix is not an existing standalone class name (namespace with `--`)
- [ ] Rendered strings come from the translation bundles (ADR-12)
