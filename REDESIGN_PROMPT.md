**Build a workout / strength-training tracker web app from scratch — a polished, animation-rich, mobile-first PWA with a clean light design.**

Design and build the complete app described below. Prioritize **fluid motion and micro-interactions** so the app feels alive and premium. All UI copy is in **English**.

**Tech stack:** React 18 + Vite, React Router v6, Tailwind CSS, **Framer Motion** for all animations, `recharts` for charts, `lucide-react` for icons. Firebase (Auth + Firestore) for login and persistence. Optimistic UI updates on save.

**Visual design language (clean light theme):**
- Backgrounds: white `#FFFFFF` surfaces, light-gray `#F7F8FA` page background.
- Primary accent: blue `#3B82F6` (buttons, active states, links, focus rings).
- Thin neutral borders `#E5E7EB`, soft subtle shadows — no dark glassmorphism.
- Text: slate `#1F2937` primary, gray `#6B7280` secondary.
- Rounded-2xl/3xl cards, generous whitespace, **Inter** font.
- Category badge tints: Push=orange, Pull=blue, Leg=blue, Other=gray (subtle).

**Animation & motion direction (make this a standout feature):**
- **Page transitions:** animated route changes (fade + slight slide/scale) via Framer Motion `AnimatePresence`.
- **Staggered entrances:** lists (exercises, history rows, exercise cards) animate in with a staggered fade-up; cards spring slightly on mount.
- **Week strip:** smooth horizontal drag/swipe to change day; the selected day animates with a sliding/scaling highlight pill (`layoutId`).
- **Number transitions:** weights, 1RM, and stats count up / roll when they change (animated number ticker).
- **Charts:** the area chart draws/animates on load; tooltip and reference line fade in.
- **Modals & bottom sheets:** spring-in (scale + fade for modals, slide-up sheet on mobile) with a fading backdrop; spring-out on close.
- **Steppers & buttons:** tactile press feedback (scale 0.96), ripple/pulse on the primary action.
- **PR celebration:** when a new personal record is logged, a small confetti burst + a bouncing trophy and a gold glow on the set.
- **Loading:** skeleton shimmer placeholders instead of blank spinners.
- **Toasts:** slide-in/out success and error toasts.
- Keep all motion **fast and subtle** (150–350ms, spring easing); respect `prefers-reduced-motion`.

**Data model (use exactly this):**
- Workout keyed by ISO date `YYYY-MM-DD`: `{ dateISO, workoutName, workoutFocus: string[] (subset of ["Push","Pull","Leg"]), workoutFuel, notes, items[] }`
- ExerciseItem: `{ name, displayName, canonicalName, sets[] }`
- Set: `{ w: number, wDisplay: string, r: number }` — `wDisplay` is a number ("60") or bodyweight notation `"BW"` / `"BW+5"`.
- Exercise library entry: `{ name, displayName, canonicalName, customCategory, customMuscles[], weightStep (default 2.5), createdAt, used }`
- Body weight log: `{ dateISO: number(kg) }`; missing dates fall back to the most recent prior entry (mark fallback with subtle `*`).
- Categories: push/pull/leg/other. Muscles: chest, shoulders, triceps, biceps, back, lats, rearShoulders, legs, quads, hamstrings, glutes, calves, core, abs, forearms, hipFlexors.

**Bodyweight (BW) logic:** users type a number, `BW`, or `BW+X`; typing `0` then blurring auto-converts to `BW`. `+`/`-` steppers respect `weightStep` and increment `BW+X`. For 1RM/volume/charts, `BW` resolves to that day's logged bodyweight (prior-date fallback); `BW+X` = bodyweight + X.

**Screens & features (build all):**

1. **Login/Signup** — email+password + "Continue with Google"; toggle login/signup (name on signup), show/hide password, inline errors, animated loading state; centered card with logo.

2. **Home/Today** (`/`) — header (logo → jump to today, date+weekday, profile avatar menu: Calendar, Feedback, Admin-if-admin, Profile); draggable **week strip** with animated selection pill, days with workouts marked; **bodyweight badge** (tap to edit, `*` for fallback); if a workout exists, a card listing exercises **sorted by muscle-group priority (leg, chest, back, shoulder, arm, core, other) then usage**, each row showing sets as animated **"reps × weight"** chips + set count; a **Push/Pull/Leg type badge** that jumps to the previous same-type day; optional Fuel/Notes blocks; tapping an exercise opens a spring **Quick-Edit modal** (per-set weight/reps steppers BW-aware, add/duplicate/delete set, delete exercise, link to detail, optimistic save); animated empty state with "Add manually"; **floating bottom nav** (Today, Exercises, prominent "Add Exercise"); **exercise picker bottom sheet** (search by name+muscles, tap to add, manual new).

3. **Workout Detail** (`/workout/:date`) — full editor: back/title/delete-workout (confirm); date heading + calendar icon to **move workout to another date** (block if target occupied); **Push/Pull/Leg** multi-select toggles + "Load from history" (fills from 2nd-most-recent matching-focus workout); per-exercise cards (name → detail, edit modal to rename-everywhere/category/muscles/weightStep, per-set steppers with `0`→`BW`, add/duplicate/delete set with smooth list animations, delete exercise); Add Exercise; Fuel input; Notes textarea; sticky animated **Save Workout** button; validation (each set needs both weight+reps or be empty; ≥1 named exercise).

4. **Exercises** (`/exercises`) — sticky search + filter chips (All/Push/Pull/Leg/Other) with animated active state; list sorted by most-used (name, category badge, "N records · Last <date> · muscles") with staggered entrance; floating **"New Exercise"** button → edit modal; seed a default exercise library if empty (Bench Press, Overhead Press, Lat Pulldown, Squat, Deadlift, etc.).

5. **Exercise Detail** (`/exercise/:name`) — header (name + muscle labels + edit); animated **stat cards** ("Best" max weight + date, "Strength change" 1RM trend % vs avg of previous 3, with count-up numbers); **recharts area chart** that animates on load, with metric toggle (Weight / 1RM / Volume) and range tabs (1W=last 3 sessions / 1M / 1Y / All) + period-max reference line; 1RM per set = `w*(1+r/30)`, session value = average of sets, best-ever = peak; **logbook history** newest-first (date, total volume, sets as "weight × reps"), PR highlight (new = gold + trophy bounce, tied = cyan + trophy); tap a row → Home at that date.

6. **Profile** (`/profile`) — avatar/name/email + cloud-backup note; settings list: Year-in-Review modal, Security & Password (expandable inline form, min 6 chars), Data Import/Export (JSON download/upload), Log out, Delete account (confirm modal offering backup export + Firebase "requires recent login" reauth handling).

7. **Admin** (`/admin`, admin-only) and **Feedback** page — restyle to the light theme.

**Routing/auth:** all routes except `/login` are protected; unauthenticated → `/login`; animated skeleton/spinner while auth resolves.

**Deliverable:** the full working app — Tailwind config (light palette + blue accent + Inter + category colors), all pages/components, Framer Motion animations throughout, Firebase data hooks. Mobile-first, snappy, and visually delightful.
