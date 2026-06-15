---
name: strength-data-design
description: Use this skill to generate well-branded interfaces and assets for Strength Data — a clean, light, mobile-first workout & strength-training tracker PWA — for production or throwaway prototypes/mocks. Contains design guidelines, colors, type, fonts, logo assets, and a full React UI-kit component library.
user-invocable: true
---

Read the `readme.md` file within this skill, and explore the other available files.

If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out of `assets/` and create static HTML files for the user to view. If working on production code, copy assets and read the rules here to become an expert in designing with this brand.

If the user invokes this skill without any other guidance, ask them what they want to build or design, ask some questions, and act as an expert designer who outputs HTML artifacts _or_ production code, depending on the need.

## Quick reference
- **Theme:** light. White `#FFFFFF` cards on `#F7F8FA` page; thin `#E5E7EB` borders; soft shadows, no glassmorphism.
- **Accent:** blue `#3B82F6` (hover `#2563EB`) for primary actions, active states, links, focus rings.
- **Text:** slate `#1F2937` primary, gray `#6B7280` secondary.
- **Categories:** Push = orange, Pull = blue, Leg = indigo, Other = gray (subtle tint + colored text). Records: gold = new PR, cyan = tied PR.
- **Type:** Inter — extrabold/bold headings & numbers (tabular), medium body, uppercase eyebrow micro-labels.
- **Shape:** rounded-3xl (24px) cards, generous whitespace, floating pill bottom nav, bottom-sheet modals.
- **Icons:** Lucide, 2px stroke. No emoji.
- **Copy:** English, plain & direct, second person ("you"), numbers-forward, `reps × weight`, `BW`/`BW+5`.

## Files
- `styles.css` — link this one file to get all tokens + Inter.
- `tokens/` — color / type / spacing / shadow / font CSS custom properties.
- `assets/` — logo + brand marks (SVG).
- `components/` — React primitives (Button, IconButton, Fab, Input, SegmentedControl, Stepper, Badge, CategoryBadge, SetChip, StatCard, Card, Avatar, BottomNav, WeekDay).
- `ui_kits/strength-data/` — full interactive app recreation (6 screens).
- `guidelines/` — foundation specimen cards.

## Using components in an HTML artifact
Link `styles.css`, load `_ds_bundle.js`, then read components off the global namespace:
```html
<link rel="stylesheet" href="styles.css" />
<script src="_ds_bundle.js"></script>
<script type="text/babel">
  const { Button, Card, SetChip } = window.StrengthDataDesignSystem_5c629b;
</script>
```
Load Lucide from CDN for icons (`unpkg.com/lucide`) and render with `lucide.<Name>.toSvg(...)`. In production React code, use `lucide-react` and reference the CSS custom properties (e.g. `var(--accent)`, `var(--surface-card)`).
