Weight/reps editor: −/＋ buttons around a centered value that is bodyweight-aware ("BW", "BW+5").

```jsx
<Stepper label="kg" value={set.w} onDecrement={() => dec('w')} onIncrement={() => inc('w')} onChange={e => setW(e.target.value)} />
<Stepper label="Reps" value={set.r} onDecrement={() => dec('r')} onIncrement={() => inc('r')} />
```

Increments respect the exercise's `weightStep`. Typing `0` then blurring should resolve to `BW` (handled by the caller).
