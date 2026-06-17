Pill of mutually-exclusive options on a sunken track — the metric toggle, time-range tabs, and filter chips.

```jsx
<SegmentedControl options={['Weight','1RM','Volume']} value={metric} onChange={setMetric} />
<SegmentedControl size="sm" fill={false} options={[{value:'1w',label:'1W'},{value:'all',label:'All'}]} value={range} onChange={setRange} />
```

Active segment lifts onto a white chip with soft shadow. Set `accent` to a category token (e.g. `var(--push-700)`) to tint the active label. Options are strings or `{value,label}`.
