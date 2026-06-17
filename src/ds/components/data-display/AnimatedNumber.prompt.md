Count-up / roll to a target value with tabular figures. For stat values, volume, 1RM.

```jsx
<AnimatedNumber value={4320} suffix=" kg" />
<AnimatedNumber value={124} decimals={1} suffix=" kg" />
<AnimatedNumber value={37} prefix="+" suffix="%" />
```

Animates from its previous value on change; respects `prefers-reduced-motion` (snaps instantly).
