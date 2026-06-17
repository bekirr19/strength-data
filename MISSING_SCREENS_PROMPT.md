**Extend the existing "Strength Data" animated design system (namespace `window.NewAnimatedSdDesign_bb0db8`) by designing the MISSING screens, modals, and states — in the exact same light, animation-rich language.**

Do NOT redesign what already exists. Reuse the existing tokens (`var(--accent)`, `var(--surface-card)`, `var(--radius-lg)`, etc.) and the existing components (Button, IconButton, Card, Badge, Avatar, Input, Stepper, FilterChip, Switch, SetChip, AnimatedNumber, StatCard, Toast, Skeleton, EmptyState, Modal, SegmentedControl). English copy, light theme, Inter, Lucide icons.

**KEEP `WeekStrip` and `BottomNav` exactly as they are** — the sliding blue pill week strip (with the small workout dots) and the floating pill bottom nav with the circular FAB are final. Reuse them as-is on every screen; do not restyle them.

**Motion language (match the existing system):** durations 150/220/320ms; standard / ease-out / spring easings; staggered list entrances (~45ms steps, transform-only so content never gets stuck invisible); count-up numbers via AnimatedNumber; spring modals + slide-up bottom sheets; skeleton shimmer on load; slide-in Toasts; and a PR celebration (confetti burst + bouncing trophy + gold glow). All gated on `prefers-reduced-motion`.

---

### Missing pieces to design

**1. Exercise Edit / New Exercise modal** (used from Exercises FAB, the Workout Detail per-exercise edit button, and Today's quick-edit). A spring `Modal` with: a name `Input`; a category selector (Push / Pull / Leg / Other) as `FilterChip`s or `SegmentedControl`; a **muscle multi-select** as toggleable chips (options: Chest, Shoulders, Triceps, Biceps, Back, Lats, Rear Delts, Legs, Quads, Hamstrings, Glutes, Calves, Core, Abs, Forearms, Hip Flexors); a **weight-step** selector (1 / 2.5 / 5 kg); primary "Save" and a destructive "Delete" (only when editing). Renaming should be presented as "renames everywhere in history".

**2. Body Weight modal** — a small spring `Modal`/sheet to log the day's bodyweight: a numeric `Input` (kg) with quick +/- `Stepper`, current value with a subtle `*` note when the value is carried over from a previous day, Save. Also show the trigger badge state used on Today.

**3. Exercise Picker bottom sheet** — slide-up sheet with a search `Input` (matches name + muscles), a scrollable list (name + `Badge` category + muscle meta + add icon), and a "New / manual exercise" row at the end. (If Today/Workout Detail already include one, ensure it matches this spec.)

**4. Quick-Edit modal (Today)** — tapping an exercise on Today opens a spring sheet: per-set bodyweight-aware `Stepper`s for weight (kg, supports `BW` / `BW+X`, typing 0 → `BW`) and reps, add/duplicate/delete set, delete exercise, a "Detail" link to the Exercise Detail screen, and "Save & close". (Ensure it exists and matches.)

**5. Calendar** — replace the "Coming soon" placeholder with a real **monthly calendar**: a month grid with prev/next month nav, each day showing a dot/tint colored by its workout focus (Push=orange, Pull=blue, Leg=indigo, combos handled — see #10), today highlighted, tap a day to select it and return to Today. Animate month changes and stagger the day cells in.

**6. Feedback page** — replace the "Coming soon" placeholder: a short intro, a `textarea` for the message + a category `SegmentedControl` (Bug / Idea / Other), a Submit `Button` that fires a success `Toast`, and optionally a small changelog/"what's new" list below.

**7. Profile — complete it.** Keep the existing layout but add: an **expandable Security & Password** inline form (new password Input, min 6 chars, Save with success/error toast); **Export data** triggering a JSON download + toast; an **Import data** modal (drag/select a `.json` file or paste JSON, preview count, confirm); and a **Delete Account confirmation modal** (danger styling, a warning, an offer to export a backup first, and a "re-authentication required" state with a "Log out & retry" action).

**8. Year in Review / Wrapped** — a celebratory recap opened from the Profile row: a sequence of swipeable full-bleed cards (or a smooth scroll) showing total workouts, total volume lifted (count-up), favourite exercise, biggest PRs, most-trained focus, longest streak, etc. On-brand: white cards, blue accent, category tints, big tabular numbers, confetti on the opening card. No emoji.

**9. Admin Panel** (`/admin`, admin-only) — a simple light-theme dashboard: a few `StatCard`s (total users, total workouts, etc.) and a users table/list. Restyle to the system; keep it minimal.

**10. Workout-type badge with combinations** — extend the category badge into a `WorkoutTypeBadge` that supports single focuses (Push / Pull / Leg) and combinations with their own tints: **Upper** (Push+Pull), **Leg + Push**, **Leg + Pull**, **Full Body** (all three). Pick calm, distinct light tints consistent with the palette. Use it on Today, Workout Detail, the week strip dots, and Calendar.

**11. Loading / skeleton states** — a skeleton layout (using `Skeleton`) for each main screen (Today, Exercises, Exercise Detail) shown while data loads, with shimmer.

**12. Empty states** (using `EmptyState`): Today with no workout ("Rest day — No workout logged. Tap below to start one."), Exercises with no search results, and Exercise Detail with no history yet.

**13. PR celebration** — wire the confetti burst + bouncing trophy + gold glow on a `SetChip` when a newly logged set beats the previous best (gold = new PR, cyan = tied PR), as described in the system's motion guidelines.

---

**Deliverable:** add these as new screens/components in the existing UI kit, reusing the current tokens and components and matching the motion language. Keep `WeekStrip` and `BottomNav` untouched. Everything mobile-first, English, light theme.
