# Design — Hospital Appointment Booking

A locked design system for this app. Every page reads this file before emitting
code. Do not regenerate per page — extend or amend this file when the system
needs to grow.

## Genre

modern-minimal — the instrument-panel register. Cool engineered canvas, one
signal accent, hairline structure, machine-readout voice.

## Macrostructure family

One app shell (the Workbench shape) covers every screen; pages vary only in
their content rhythm.

- App shell (all roles): side rail + sticky header band + content canvas
- Dashboard pages: header → stat row → panel stack
- List pages: header → table panel
- Form pages: header → form panel + summary panel (two-column at ≥1024px)
- Detail/focus pages: header → single centred panel

## Theme — Cobalt

- `--color-paper`      oklch(98.5% 0.004 250)
- `--color-paper-2`    oklch(96.4% 0.006 250)
- `--color-paper-3`    oklch(93.6% 0.008 250)
- `--color-ink`        oklch(24% 0.02 258)
- `--color-ink-2`      oklch(34% 0.018 257)
- `--color-ink-3`      oklch(52% 0.014 256)
- `--color-rule`       oklch(90% 0.008 252)
- `--color-rule-2`     oklch(83% 0.012 252)
- `--color-accent`     oklch(58% 0.20 256)
- `--color-accent-ink` oklch(99% 0.002 250)
- `--color-focus`      oklch(58% 0.20 256)

Paper band: cool light. Display style: grotesk-sans. Accent hue: electric
cobalt, used as a signal never a flood (≤ 5% of any viewport).

## Typography

- Display: Space Grotesk, weight 500–600, style normal
- Body:    Inter, weight 400/500
- Mono:    JetBrains Mono, weight 400/500 — tokens, fees, timestamps, labels
- Display tracking: -0.02em
- Type scale anchor: `--text-2xl` = 2.25rem (page titles only)
- Numerals in tables and stats are tabular (`font-variant-numeric: tabular-nums`)
- Headings are always roman. Emphasis carries via weight, accent colour, or rule.

## Spacing

4-point named scale. Values live in `tokens.css`. Pages must use named tokens
(`var(--space-md)`), never raw values.

## Motion

- Easings: `--ease-out` cubic-bezier(0.16, 1, 0.3, 1), `--ease-in`,
  `--ease-in-out`
- Reveal pattern: none — the app is composed, not revealed
- Transitions are colour/border/opacity only, 160–220ms
- Reduced-motion fallback: opacity-only, ≤ 150ms, no transform

## Microinteractions stance

- Silent success — no celebratory toasts; a state change is the feedback
- Destructive actions confirm inline in the UI, never via `window.confirm`
- Hover: 1px border-colour shift toward cobalt; never layout shift
- Focus: instant visible ring, never animated
- Every interactive element ships all 8 states (default · hover · focus ·
  active · disabled · loading · error · success)

## CTA voice

- Primary: solid cobalt fill, 6px radius, names the destination ("Confirm
  booking", "Call next patient")
- Secondary: hairline border, ink text, same radius and padding rhythm
- Tertiary: inline cobalt text link with a rule on hover
- Never a pill. Never a gradient.

## Per-page allowances

- App pages MUST NOT use enrichment — function carries the page.
- No photography, no illustration, no background pattern.
- The one dark beat is the graphite panel (patient token, login brand panel,
  doctor "now serving") — at most one per page.

## What pages MUST share

- The wordmark and the mono role label
- The accent colour and its placement
- The display + body + mono fonts
- The CTA voice (radius, padding rhythm, naming)
- The hairline surface language: 1px `--color-rule` borders, no drop shadows
- The status vocabulary: cobalt = active, ink = neutral, amber = attention,
  red = problem, ok-green = success

## What pages MAY differ on

- Content rhythm (stat row vs table vs form + summary)
- Whether the page opens with a graphite beat (at most one per page)
- Panel count and column split

## Exports

### tokens.css

```css
:root {
  --color-paper:      oklch(98.5% 0.004 250);
  --color-paper-2:    oklch(96.4% 0.006 250);
  --color-paper-3:    oklch(93.6% 0.008 250);
  --color-ink:        oklch(24% 0.02 258);
  --color-ink-2:      oklch(34% 0.018 257);
  --color-ink-3:      oklch(52% 0.014 256);
  --color-rule:       oklch(90% 0.008 252);
  --color-rule-2:     oklch(83% 0.012 252);
  --color-accent:     oklch(58% 0.20 256);
  --color-accent-ink: oklch(99% 0.002 250);
  --color-focus:      oklch(58% 0.20 256);

  --font-display: "Space Grotesk", sans-serif;
  --font-body:    "Inter", sans-serif;
  --font-mono:    "JetBrains Mono", monospace;

  --space-3xs: 0.25rem;  --space-2xs: 0.5rem;  --space-xs: 0.75rem;
  --space-sm:  1rem;     --space-md:  1.5rem;  --space-lg: 2rem;
  --space-xl:  3rem;     --space-2xl: 4.5rem;  --space-3xl: 7rem;

  --text-xs: 0.75rem;  --text-sm: 0.875rem; --text-md: 1.125rem;
  --text-lg: 1.375rem; --text-xl: 1.75rem;  --text-2xl: 2.25rem;

  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --dur-short: 160ms;
  --radius-control: 6px;
  --radius-card: 10px;
}
```

### Tailwind v4 `@theme`

```css
@theme {
  --color-paper:   oklch(98.5% 0.004 250);
  --color-ink:     oklch(24% 0.02 258);
  --color-accent:  oklch(58% 0.20 256);
  --font-display:  "Space Grotesk", sans-serif;
  --font-body:     "Inter", sans-serif;
  --font-mono:     "JetBrains Mono", monospace;
  --spacing-md:    1.5rem;
  --text-md:       1.125rem;
  --ease-out:      cubic-bezier(0.16, 1, 0.3, 1);
}
```

### DTCG `tokens.json`

```json
{
  "color": {
    "paper":  { "$value": "oklch(98.5% 0.004 250)", "$type": "color" },
    "ink":    { "$value": "oklch(24% 0.02 258)", "$type": "color" },
    "accent": { "$value": "oklch(58% 0.20 256)", "$type": "color" }
  },
  "font": {
    "display": { "$value": "Space Grotesk", "$type": "fontFamily" },
    "body":    { "$value": "Inter", "$type": "fontFamily" },
    "mono":    { "$value": "JetBrains Mono", "$type": "fontFamily" }
  },
  "space": {
    "md": { "$value": "1.5rem", "$type": "dimension" }
  }
}
```

### shadcn/ui CSS variables

```css
:root {
  --background:         98.5% 0.004 250;
  --foreground:         24% 0.02 258;
  --primary:            58% 0.20 256;
  --primary-foreground: 99% 0.002 250;
  --muted:              90% 0.008 252;
  --muted-foreground:   52% 0.014 256;
  --border:             90% 0.008 252;
  --input:              90% 0.008 252;
  --ring:               58% 0.20 256;
  --radius:             6px;
}
```
