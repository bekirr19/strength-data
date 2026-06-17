# Strength Data — Design System

A clean, **light**, mobile-first design system for **Strength Data**, a workout & strength-training tracker PWA. Users log daily workouts (exercises, sets, reps, weights), track bodyweight, and watch per-exercise progress charts (Weight / 1RM / Volume) with PR highlighting.

This system is a **visual redesign** of the existing app. The data model, features, and interactions are unchanged — only the look is new: a fresh light theme replacing the old dark UI, with English copy throughout.

---

## Product context

- **What it is:** a single-product mobile-first PWA (React 18 + Vite, React Router, Tailwind, Firebase Auth + Firestore, recharts, lucide-react).
- **Core jobs:** log today's workout fast; flip through days on a swipeable week strip; track bodyweight (with `BW` / `BW+X` notation in set weights); browse an exercise library; drill into an exercise for charts + a PR-highlighted logbook; manage account + data import/export.
- **Audience:** people who lift and want their numbers to go up — pragmatic, numbers-forward, not gamified.

### Sources used to build this system
- **Codebase:** mounted local folder `src/` (the live React app). Key files read: `pages/MainPage.jsx` (Today), `pages/WorkoutDetailPage.jsx`, `pages/ExercisesPage.jsx`, `pages/ExerciseDetailPage.jsx` (charts + logbook), `pages/LoginPage.jsx`, `pages/ProfilePage.jsx`, `components/WeekStrip.jsx`, `utils/workoutTypes.js`, `utils/exerciseMetadata.js`, `data/defaultExercises.js`.
- **Logo:** `uploads/logo-blue.svg` → copied to `assets/logo-blue.svg`.
- **Note on language:** the original codebase UI is in **Turkish**. This redesign is specified in **English**, so all kit copy, labels, and muscle names are English (e.g. *Göğüs → Chest*, *Egzersiz Ekle → Add Exercise*).

> The original app's data model is preserved exactly: `Workout { dateISO, workoutName, workoutFocus[], workoutFuel, notes, items[] }`, `ExerciseItem { name, displayName, canonicalName, sets[] }`, `Set { w, wDisplay, r }` where `wDisplay` may be `"60"`, `"BW"`, or `"BW+5"`.

---

## Content fundamentals

**Voice:** plain, direct, encouraging without being loud. Speak to the user as **you**. Short imperative actions ("Add Exercise", "Save Workout", "Log out"). No hype, no exclamation walls.

**Casing:** Title Case for buttons and screen titles ("Workout Detail", "New Exercise"). Sentence case for helper text and descriptions ("Pick up your training right where you left off"). UPPERCASE only for tiny eyebrow labels and category badges (`STRENGTH CHANGE`, `PUSH`), always with wide letter-spacing.

**Numbers lead.** Weights, reps, 1RM, volume, and percentages are the heroes. Always tabular figures (`.sd-tnum`). Units are lowercase and spaced: `100 kg`, `+4%`, `4,320 kg`. Sets read as **`reps × weight`** (e.g. `6 × 100`). Bodyweight is `BW` / `BW+5`, never spelled out.

**Tone examples**
- Empty state: *"No workout logged for this day — Add your first exercise to get started."*
- Stat caption: *"vs your last 3 sessions"*
- Auth: *"Welcome back" / "Pick up your training right where you left off"*
- Profile note: *"Your data is backed up in the cloud"*

**Emoji:** none. The brand uses crisp line icons, never emoji.

---

## Visual foundations

**Overall vibe:** airy, white, and calm. Generous whitespace, rounded surfaces, soft shadows, one confident blue accent. The opposite of the old dark/glass theme — nothing glows, nothing blurs.

**Color**
- Surfaces: pure white `#FFFFFF` cards on a light-gray page `#F7F8FA`; recessed fills `#F1F3F5`.
- Accent: a single blue `#3B82F6` (hover/pressed `#2563EB`) for primary buttons, active states, links, focus rings.
- Text: slate `#1F2937` primary, gray `#6B7280` secondary, `#9CA3AF` placeholder.
- Borders: thin neutral hairlines `#E5E7EB`.
- **Category tints** (subtle tint + colored text, never loud): **Push = orange**, **Pull = blue**, **Leg = indigo** (a distinct, calmer blue so Leg reads apart from Pull — a deliberate refinement of the brief's "Leg = blue"), **Other = gray**.
- **Records:** **gold `#F59E0B`** = new PR, **cyan `#06B6D4`** = tied PR; green `#16A34A` positive trend, red `#EF4444` destructive.

**Type:** Inter throughout. Extrabold/bold for headings, dates, and stat values; medium for body; bold uppercase micro-labels with `0.14em` tracking for eyebrows. Tight tracking (`-0.02em`) on large numbers and headings.

**Spacing & shape:** 4px spacing base. Radii climb from chips (8px) → buttons/inputs (12px) → list rows (16px) → **cards 24px (rounded-3xl)** → pills/nav/FAB/avatars (full). Cards have comfortable 16–24px padding.

**Elevation:** soft, low-contrast shadows only — `xs` on inputs, `sm` on cards, `md` on hover lift, `lg` on the floating bottom nav. The single "glow" is a subtle blue shadow under the primary CTA / FAB. **No glassmorphism, no backdrop blur on content** (a faint blur only behind sticky headers over scrolling content).

**Motion:** quick and gentle. Content enters with a 320ms slide-up + fade (`.sd-slide-in`). Hover lifts cards 1px and deepens the shadow; press scales to `0.98`. Easing is a soft ease-out `cubic-bezier(0.22,1,0.36,1)`. Respects `prefers-reduced-motion`.

**Hover / press states:** buttons darken the accent (primary) or fill gray (ghost/soft) on hover; everything tappable scales down slightly on press. Focus shows a 3px blue ring (`--ring`).

**Layout rules:** mobile-first single column (max ~448px) centered on desktop. Sticky header + sticky week strip; a **floating pill bottom nav** fixed 16px from the screen edges holding two icon tabs plus a prominent "Add Exercise" primary. Modals are **bottom sheets** with a grab handle. Imagery is minimal — this is a utility app; the visual interest comes from data, category color, and clean type, not photos or illustrations.

---

## Iconography

- **Library:** [Lucide](https://lucide.dev) — the same family the app ships (`lucide-react`). Clean 2px-stroke outline icons, `currentColor` so they inherit text color. In these HTML cards/kits Lucide is loaded from CDN (`unpkg.com/lucide`) and rendered via `lucide.<Name>.toSvg(...)`; in React product code use `lucide-react`.
- **Common icons:** `Plus` (add), `Search`, `ChevronRight`, `ArrowLeft`/`ArrowRight`, `CalendarDays`, `ListChecks`, `Pencil`/`SlidersHorizontal` (edit), `Trash2`, `Copy` (duplicate set), `Trophy` (PR), `TrendingUp`, `Scale`/`Zap` (bodyweight/fuel), `Mail`/`Lock`/`Eye`/`EyeOff` (auth), `User`, `LogOut`, `Download`/`Upload`, `Check`, `X`.
- **Stroke weight:** 2px standard; size 16–22px in UI, 13px inside chips/badges.
- **Material Symbols:** the legacy app also used Material Symbols Outlined; the redesign standardizes on **Lucide only** for consistency. *(Substitution flagged — see Caveats in the project summary.)*
- **Emoji / unicode icons:** not used. The only non-icon glyph is `×` between reps and weight and `*` marking a fallback bodyweight value.
- **Logo assets** (in `assets/`): `logo-blue.svg` (original dark-navy app mark), `mark-app.svg` (light-friendly blue rounded-square icon), `mark-blue.svg` (inline blue barbell glyph for the wordmark lockup on white).

---

## Index / manifest

**Root**
- `styles.css` — global entry point (consumers link this); `@import`s all tokens.
- `tokens/` — `colors.css`, `typography.css`, `spacing.css`, `shadows.css`, `fonts.css`, `base.css`.
- `assets/` — `logo-blue.svg`, `mark-app.svg`, `mark-blue.svg`.
- `readme.md` (this file), `SKILL.md`.

**Components** (`window.StrengthDataDesignSystem_5c629b.<Name>`)
- `buttons/` — **Button**, **IconButton**, **Fab**
- `forms/` — **Input**, **SegmentedControl**, **Stepper**
- `data-display/` — **Badge**, **CategoryBadge** (+ `CATEGORY_COLORS`), **SetChip**, **StatCard**
- `layout/` — **Card**, **Avatar**
- `navigation/` — **BottomNav** (floating pill with a central circular FAB), **WeekStrip** (swipeable strip with a sliding accent pill), **WeekDay** (single day cell)

**Foundation cards** (`guidelines/`) — Colors (primary, neutrals, categories, status), Type (headings, body, numeric), Spacing (radii, shadows, scale), Brand (logo).

**UI kit** (`ui_kits/strength-data/`) — interactive light-theme app: Login, Today, Workout Detail, Exercises, Exercise Detail, Profile. Open `index.html` and use the screen switcher.

**Design System tab groups:** Type · Colors · Spacing · Brand · Components · Strength Data App.
