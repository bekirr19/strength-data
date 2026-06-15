# Redesign Prompt for Strength Tracker (Light "Claude" Theme)

## Context
The user has a working workout/strength tracker (React + Vite + Tailwind + Firebase, React Router, recharts, lucide-react + Material Symbols). It currently uses a **dark** theme (`#0B1121` bg, blue `#3b82f6` accent, Inter font, Turkish UI). The user wants to **redesign the UI from scratch in a clean light theme** (white background + blue accent), with **English copy**, while **keeping every existing feature and the data model unchanged**. The deliverable below is a ready-to-paste prompt to hand to Claude to do the rebuild.

---

## The Prompt (copy everything below this line)

> **Build a workout / strength-training tracker web app — a complete UI rebuild in a clean, modern light design.**
>
> This is a **redesign of an existing app**. Keep ALL the functionality and the data model described below exactly the same — only the visual design language changes. The app must be **mobile-first** (it's used as a PWA on phones) but also work nicely on desktop. All UI copy is in **English**.
>
> ### Tech stack
> - React 18 + Vite, React Router v6 (client-side routes)
> - Tailwind CSS for styling
> - Firebase (Auth + Firestore) for login and data persistence
> - `recharts` for charts, `lucide-react` for icons
> - State via React hooks; optimistic UI updates on save
>
> ### Design language (the part that changes)
> A clean, airy, **light** theme inspired by modern minimal product design:
> - **Backgrounds:** pure white `#FFFFFF` for main surfaces, very light gray `#F7F8FA` for the page/app background and recessed areas.
> - **Accent / primary:** blue `#3B82F6` for primary buttons, active states, links, and focus rings.
> - **Borders:** thin neutral borders `#E5E7EB`; cards use soft, subtle shadows instead of heavy glass/blur.
> - **Text:** near-black slate `#1F2937` for primary text, mid-gray `#6B7280` for secondary/meta, light gray for placeholders.
> - **Cards:** generous rounded corners (`rounded-2xl` / `rounded-3xl`), comfortable padding, plenty of whitespace.
> - **Typography:** Inter. Bold weights for headings/values, medium for body.
> - **Icons:** lucide-react (and/or Material Symbols Outlined) — keep them minimal and consistent.
> - **Category colors** (used for badges/labels): Push = orange, Pull = blue, Leg = blue, Other = gray. Keep these subtle (tinted background + colored text), not loud.
> - Smooth, subtle transitions/animations (slide-in on content, gentle hover states). No dark glassmorphism.
> - A fixed/floating bottom navigation bar on mobile.
>
> ### Data model (keep identical)
> - **Workout** (keyed by ISO date `YYYY-MM-DD`): `{ dateISO, workoutName, workoutFocus: string[] (subset of ["Push","Pull","Leg"]), workoutFuel: string, notes: string, items: ExerciseItem[] }`
> - **ExerciseItem:** `{ name, displayName, canonicalName, sets: Set[] }`
> - **Set:** `{ w: number, wDisplay: string, r: number }` — `wDisplay` is the human label and may be a plain number ("60"), or bodyweight notation **"BW"** or **"BW+5"**. `w` is the resolved numeric kg.
> - **Exercise library entry:** `{ name, displayName, canonicalName, customCategory, customMuscles: string[], weightStep (default 2.5), createdAt, used }`
> - **Body weight log:** map of `{ dateISO: number(kg) }`. When a date has no entry, fall back to the most recent **prior** entry (mark it as a fallback value with a subtle `*`).
> - **Categories:** `push | pull | leg | other`. **Muscles:** chest, shoulders, triceps, biceps, back, lats, rearShoulders, legs, quads, hamstrings, glutes, calves, core, abs, forearms, hipFlexors.
>
> ### Bodyweight (BW) logic (keep)
> - Users can type a number, or `BW`, or `BW+X` as a set weight. Typing `0` and blurring auto-converts to `BW`.
> - Weight steppers (`+`/`-`) respect the exercise's `weightStep` and correctly increment `BW+X`.
> - For 1RM/volume/charts, `BW` resolves to that day's logged bodyweight (with prior-date fallback); `BW+X` = bodyweight + X.
>
> ### Screens & features (keep all of these)
>
> **1. Login / Signup** — Email+password and "Continue with Google". Toggle between Login and Signup (name field on signup), show/hide password, inline error messages, loading state. A clean centered card on a light background with the app logo.
>
> **2. Home / Today** (route `/`)
> - Header: app logo (tapping it jumps to today), the selected date + weekday, and a profile avatar button opening a menu: **Calendar**, **Feedback**, **Admin** (only if admin), **Profile**.
> - **Week strip:** a horizontal row of days; tap to select; **swipe left/right** anywhere on the page to move one day. Days that have workouts are visually marked.
> - **Body-weight badge:** shows current kg (or "Add weight"); tap to open a body-weight editor modal. Shows `*` when value is a fallback from a previous day.
> - If a workout exists for the day: a card listing its exercises, **sorted by muscle-group priority** (leg, chest, back, shoulder, arm, core, other) then by usage. Each exercise row shows its name and its sets as compact **"reps × weight"** chips and a set count. A **workout-type badge** (Push/Pull/Leg, combos like "Upper"/"Full") that, when tapped, jumps to the previous day of the same type. Optional **Fuel** and **Notes** blocks. An edit button → opens the full Workout Detail page.
> - Tapping an exercise row opens a **Quick-Edit modal**: per-set weight & reps with `+`/`-` steppers (BW aware), add set, duplicate set, delete set, delete exercise, a link to the exercise's Detail page, and Save (optimistic).
> - Empty state when no workout: friendly message + "Add manually" button + body-weight badge.
> - **Bottom nav:** Today button, Exercises-list button, and a prominent **"Add Exercise"** button that opens the exercise picker.
> - **Exercise picker modal:** search field (matches name + muscle labels), list showing name + category + muscle labels, tap to add to today's workout; a "New / manual exercise" option.
>
> **3. Workout Detail** (route `/workout/:date`) — the full editor.
> - Top bar: back, "Workout Detail" title, delete-workout (with confirm).
> - Big date heading + a calendar icon to **move the workout to another date** (blocks if target date already has a workout).
> - **Push / Pull / Leg** multi-select toggle buttons. A "Load from history" action that fills the workout with exercises from the 2nd-most-recent workout matching the selected focus.
> - For each exercise: a card with the exercise name (tap → Exercise Detail), an edit button opening an **Exercise Edit modal** (rename — and rename everywhere in history —, set category, set muscles, set weightStep), per-set weight & reps steppers (BW logic, `0`→`BW` on blur), add/duplicate/delete set, delete exercise.
> - "Add Exercise" (same picker as Home). **Fuel** text input and **Notes** textarea.
> - Sticky bottom **"Save Workout"** button. Validation: each set needs both weight and reps or be fully empty; at least one named exercise required.
>
> **4. Exercises** (route `/exercises`)
> - Sticky search bar + category filter chips: **All / Push / Pull / Leg / Other**.
> - List sorted by most-used, each row: name, category badge, and meta line ("N records · Last <date> · muscles").
> - Floating **"New Exercise"** button → Exercise Edit modal (name, category, muscles multi-select, weightStep). Edit/delete existing.
> - On first load, seed a default library of common exercises if empty (Bench Press, Overhead Press, Lat Pulldown, Squat, Deadlift, etc. across push/pull/leg/other).
>
> **5. Exercise Detail** (route `/exercise/:name`)
> - Header: exercise name + its muscle labels + edit button.
> - **Stat cards:** "Best" (max weight ever, with date) and "Strength change" (1RM trend % vs avg of previous 3 sessions).
> - **Progress chart** (recharts area): metric toggle **Weight / 1RM (strength) / Volume**, and time-range tabs **1W (last 3 sessions) / 1M / 1Y / All**. Reference line at the period max. Use the accent/category colors for the series.
> - 1RM estimate per set = `w * (1 + r/30)`; a session's representative 1RM is the **average** of its sets' 1RMs; "best ever" uses the **peak**. BW resolves via the bodyweight log.
> - **Logbook history** (newest first): each session row shows date, total volume, and its sets as "weight × reps". Highlight the max set: **new PR = gold + trophy**, **tied PR = cyan + trophy**. Tapping a row navigates Home to that date.
>
> **6. Profile** (route `/profile`)
> - Avatar + name + email, "your data is backed up in the cloud" note.
> - Settings list: **Year in Review / Wrapped** modal, **Security & Password** (expandable inline form, min 6 chars), **Data Import / Export** (export all data as JSON download; import from JSON). **Log out** button. **Delete account** (confirmation modal that offers a backup export first and handles Firebase "requires recent login" reauth flow).
>
> **7. Admin panel** (route `/admin`, admin-only) and **8. Feedback** page (route `/gelistirmeler` or `/feedback`) — keep these routes/behaviors; restyle to the new light theme.
>
> ### Routing & auth
> - All routes except `/login` are protected; unauthenticated users redirect to `/login`. Show a loading spinner while auth resolves.
>
> ### Deliverable
> Rebuild the full app with the above features intact, restyled in the clean light theme. Provide the Tailwind config (light palette + blue accent + Inter + the category colors), all pages/components, and the Firebase data hooks. Keep interactions snappy with optimistic updates. Make sure it looks great on a phone first.

---

## Verification (after the user runs the rebuild)
- `npm run dev`, then walk each screen: Login → Home (week strip swipe, body-weight badge, quick-edit) → Add via picker → Workout Detail (steppers, BW, Push/Pull/Leg, save) → Exercises (search/filter/new) → Exercise Detail (chart metric/range toggles, PR highlighting) → Profile (export JSON, password form).
- Confirm light theme + blue accent applied consistently and all copy is English.
- Confirm data round-trips through Firebase unchanged (existing backups import cleanly).
