# Design: Japan Kanji

The locked system. Every UI build and screen redesign reads this first and all pages share it. Change it on purpose; the file is the rule.

## System
- **Genre**: `editorial` × `modern-minimal` (Japanese Editorial & Tactile Craft)
- **Shape**: App Workbench (`AppShell` with persistent left Sidebar on desktop, tactile bottom navigation on mobile, and focused Zen studio canvas for Lesson/Review sessions)
- **Theme**: Custom — *"Warm Washi paper, Sumi ink, Cinnabar seal, tactile spring motion"*
- **Axes**: Light Washi paper (`oklch(0.985 0.004 85)`) / High-contrast Sumi ink (`oklch(0.14 0.01 250)`) / Cinnabar Vermilion accent (`oklch(0.55 0.21 27)`) · posture: crisp architectural hairlines with warm tactile cards

## Tokens
`japan-kanji-frontend/src/index.css` is the source of truth. The core roles:
```css
:root {
  --color-paper-1: oklch(0.995 0.003 85);      /* Pure warm washi card surface */
  --color-paper-2: oklch(0.972 0.006 85);      /* Primary app background canvas */
  --color-paper-3: oklch(0.942 0.009 85);      /* Secondary recessed surface / hover */

  --color-surface-1: oklch(0.18 0.015 255);    /* Deep sumi charcoal for Zen study studio */
  --color-surface-2: oklch(0.14 0.015 255);    /* Elevated dark surface */
  --color-surface-3: oklch(0.11 0.012 255);    /* Deepest dark backdrop */

  --color-accent-1: oklch(0.55 0.21 27);       /* Cinnabar Red / Hanko Vermilion */
  --color-accent-2: oklch(0.46 0.19 27);       /* Pressed / dark Cinnabar */
  --color-accent-soft: oklch(0.95 0.03 27);    /* Tinted Cinnabar wash */

  --color-gold-1: oklch(0.75 0.15 80);         /* Kintsugi Gold for badges */
  --color-emerald-1: oklch(0.56 0.15 155);     /* Bamboo Emerald for mastery */

  --color-ink-1: oklch(0.14 0.012 250);        /* Primary Sumi ink */
  --color-ink-2: oklch(0.40 0.012 250);        /* Secondary muted ink */
  --color-ink-3: oklch(0.60 0.010 250);        /* Subtle caption / placeholder ink */
  --color-ink-inverse-1: oklch(0.98 0.004 85); /* Light text on dark surfaces */
  --color-ink-inverse-2: oklch(0.72 0.010 250);/* Muted text on dark surfaces */

  --color-border-subtle: oklch(0.89 0.008 85); /* Hairline structural rule */
  --color-border-strong: oklch(0.76 0.012 250);/* Interactive / emphasized border */

  --font-sans: "Inter", system-ui, -apple-system, sans-serif;
  --font-serif: "Shippori Mincho", "Noto Serif JP", serif;
  --radius-card: 12px;
  --radius-control: 8px;
}
```

## Typography & Hierarchy
- **Kanji Characters & Display Titles**: Always rendered in `--font-serif` (`Shippori Mincho`) for authentic brush-inspired serif terminals.
- **Interface Controls, Vietnamese Body & Readings**: Rendered in `--font-sans` (`Inter`) with tabular numerals (`tabular-nums`) for counters and statistics.

## Controls & Surfaces
- **Primary Button**: Sumi ink (`--color-ink-1`) or Cinnabar (`--color-accent-1`) fill, crisp `8px` radius, subtle top highlight, active scale `0.98`.
- **Secondary Button**: Paper surface (`--color-paper-1`) with `1px` `--color-border-subtle`, hover transition to `--color-paper-3` and `--color-border-strong`.
- **Cards**: Warm paper (`--color-paper-1`), `1px` border (`--color-border-subtle`), `12px` radius, subtle multi-layered elevation on hover (`-translate-y-0.5`), optional radial spotlight tracking mouse coordinates.
- **Modals & Toasts**: Frosted glass (`backdrop-blur-md bg-[var(--color-paper-1)]/95`) with spring entry/exit animations; zero browser-native `alert()` or `confirm()`.

## Motion
- **Character**: Tactile & springy (`stiffness: 320, damping: 26`); staggered list reveals; smooth spring number tickers (`AnimatedNumber`); celebratory confetti burst on study session completion.
- **Accessibility**: Full `prefers-reduced-motion: reduce` support disabling decorative transforms and animations.

