Centered icon tile + title + subtitle + optional action for empty / zero states.

```jsx
<EmptyState tone="accent" icon={<Dumbbell size={26}/>}
  title="No workout logged for this day"
  subtitle="Add your first exercise to get started."
  action={<Button variant="primary" icon={<Plus size={18}/>}>Add manually</Button>} />
```

`tone="accent"` tints the icon tile blue. Use for Today (no workout), Exercises (no results), Exercise Detail (no history).
