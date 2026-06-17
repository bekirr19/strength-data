Pill toggle for category filters and muscle multi-selects — active = accent fill.

```jsx
<FilterChip label="All" active={f==='all'} onClick={() => setF('all')} count={42} />
<FilterChip label="Push" active={f==='push'} accent="var(--push-500)" onClick={() => setF('push')} />
<FilterChip label="Chest" active={sel.has('Chest')} onClick={() => toggle('Chest')} />
```

Pass `accent` to fill with a category colour when active. `count` shows a trailing number.
