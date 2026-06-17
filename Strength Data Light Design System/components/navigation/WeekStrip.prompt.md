A swipeable 7-day strip with a single sliding accent **pill** that springs to the selected day. Days with a logged workout show a small category-colored dot. Drop-in replacement for laying out individual `WeekDay` cells.

```jsx
const WEEK = [
  { iso: '2026-06-09', wd: 'Tue', d: 9,  category: 'leg' },
  { iso: '2026-06-12', wd: 'Fri', d: 12, category: 'pull' },
  { iso: '2026-06-15', wd: 'Mon', d: 15, category: 'push', today: true },
  // …
];

<WeekStrip days={WEEK} selectedISO={selected} onSelect={setSelected} />
```

The pill slides via `transform` on the spring easing token, so all 7 cells stay equal-width. Sits well inside a sticky header band. Use it on Today; for a single static cell use `WeekDay`.
