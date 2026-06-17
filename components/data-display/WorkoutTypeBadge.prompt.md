Workout-focus badge covering single focuses and combos with their own calm tints.

```jsx
<WorkoutTypeBadge type="push" />
<WorkoutTypeBadge focus={['push','pull']} />        {/* → Upper, violet */}
<WorkoutTypeBadge focus={['leg','push']} dot />     {/* → Leg + Push, teal */}
<WorkoutTypeBadge type="full" onClick={jumpPrev} /> {/* Full Body, slate */}
```

Combos: `upper` (Push+Pull, violet), `legPush` (teal), `legPull` (rose), `full` (Full Body, slate). Use `workoutTypeOf(focus)` to derive the key; `WORKOUT_TYPE_COLORS` is exported for the WeekStrip dots / Calendar.
