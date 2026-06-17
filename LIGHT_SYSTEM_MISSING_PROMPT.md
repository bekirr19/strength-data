**Extend the existing "Strength Data Light Design System" (namespace `window.StrengthDataDesignSystem_5c629b`) with the MISSING components, screens, modals, and states — in its exact light visual language.**

Do NOT restyle or rebuild anything that already exists. Reuse the existing tokens (`var(--accent)`, `var(--surface-card)`, `var(--surface-sunken)`, `var(--border-subtle)`, `var(--radius-lg)`, `var(--shadow-md)`, `var(--ease-spring)`, `var(--press-scale)`, etc.) and the existing components (Button, IconButton, Fab, Input, Stepper, SegmentedControl, Badge, CategoryBadge, SetChip, StatCard, Card, Avatar, **WeekStrip**, **BottomNav**). English copy, light theme, Inter, Lucide icons.

**KEEP the navigation components exactly as they are** — `WeekStrip` (sliding accent pill + category dots), `BottomNav` (floating pill with the central circular FAB), and `SegmentedControl` (sliding pill) are final. Reuse them as-is; do not change them.

**Motion language (match this system):** content enters with the `.sd-slide-in` (320ms slide+fade); pills/segments slide on `--ease-spring`; tappable things press-scale via `--press-scale`; focus shows a 3px `--ring`. Add new motion in the same restrained spirit (spring modals, slide-up sheets, gentle stagger, count-up numbers, skeleton shimmer, slide-in toasts) and respect `prefers-reduced-motion`.

---

### A) Missing primitives to add first (so the screens can use them)

1. **Modal** — a spring dialog (scale+fade on a translucent slate scrim) AND a slide-up bottom-sheet variant with a grab handle. Reuse the sheet pattern already used by the kit's Exercise Picker / Quick-Edit. Props: `open`, `onClose`, `title`, `subtitle`, optional `eyebrow`, optional header-right slot, `variant: 'dialog' | 'sheet'`.
2. **Toast** — slide-in notification (success / error / info), auto-dismiss, fixed dock. Use status tokens (green / red / accent).
3. **Skeleton** — shimmer placeholder blocks/lines for loading states.
4. **EmptyState** — centered icon tile + title + subtitle + optional action button.
5. **Switch** — accessible on/off toggle (accent when on, spring knob).
6. **AnimatedNumber** — count-up/roll tabular number (used for stat values, volume, 1RM).
7. **FilterChip** — pill toggle for the Exercises category filters (active = accent fill).
8. **WorkoutTypeBadge** — extend CategoryBadge to support single focuses (Push / Pull / Leg) AND combinations with their own calm light tints: **Upper** (Push+Pull), **Leg + Push**, **Leg + Pull**, **Full Body**. Use it on Today, Workout Detail, the WeekStrip dots, and Calendar.

### B) Missing screens / modals / flows

9. **Exercise Edit / New Exercise modal** (from the Exercises FAB, Workout Detail's per-exercise edit, and Today's quick-edit). Fields: name `Input`; category as `FilterChip`s or `SegmentedControl` (Push / Pull / Leg / Other); a **muscle multi-select** of toggle chips (Chest, Shoulders, Triceps, Biceps, Back, Lats, Rear Delts, Legs, Quads, Hamstrings, Glutes, Calves, Core, Abs, Forearms, Hip Flexors); a **weight-step** selector (1 / 2.5 / 5 kg); "Save" + a destructive "Delete" (edit mode only). Note renaming as "renames everywhere in history".
10. **Body Weight modal** — small dialog/sheet: numeric `Input` (kg) + quick `Stepper`, current value with a subtle `*` note when carried over from a previous day, Save.
11. **Calendar** — monthly grid with prev/next nav, each day dotted/tinted by its workout focus (use WorkoutTypeBadge colors), today highlighted, tap a day to select and return to Today; animate month changes, stagger the cells.
12. **Profile — complete it:** expandable **Security & Password** inline form (new password, min 6 chars, Save → toast); **Export data** → JSON download + toast; **Import data** modal (select/paste a `.json`, preview count, confirm); **Delete Account** confirmation modal (danger, warning, offer a backup export first, plus a "re-authentication required" state with a "Log out & retry" action).
13. **Year in Review / Wrapped** — opened from Profile: a sequence of swipeable cards (or a smooth scroll) — total workouts, total volume (AnimatedNumber), favourite exercise, biggest PRs, most-trained focus, longest streak — white cards, blue accent, category tints, big tabular numbers, a confetti burst on the opening card. No emoji.
14. **Feedback page** — short intro, a category `SegmentedControl` (Bug / Idea / Other), a message `textarea`, Submit → success toast; optional small "what's new" list.
15. **Admin Panel** (`/admin`, admin-only) — a minimal light dashboard: a few `StatCard`s (total users, total workouts, etc.) + a users list/table.

### C) States to cover across existing screens

16. **Loading skeletons** for Today, Exercises, and Exercise Detail (using `Skeleton`).
17. **Empty states** (using `EmptyState`): Today with no workout ("No workout logged for this day — Add your first exercise to get started."), Exercises with no search results, Exercise Detail with no history yet.
18. **PR celebration** — confetti burst + bouncing trophy + gold glow on a `SetChip` when a logged set beats the previous best (gold = new PR, cyan = tied PR).

---

**Deliverable:** add these as new components, screens, and states in the existing design system — reusing its tokens and components, matching its motion. Keep WeekStrip, BottomNav, and SegmentedControl untouched. Update the UI kit so the new screens are reachable. Everything mobile-first, English, light theme.
