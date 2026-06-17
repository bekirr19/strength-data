Shimmer placeholder for loading states.

```jsx
<Skeleton variant="title" />
<SkeletonGroup lines={3} />
<Skeleton variant="card" />
<div style={{display:'flex',gap:8}}><Skeleton variant="avatar"/><SkeletonGroup lines={2}/></div>
```

Variants: `line, text, title, chip, block, card, avatar`. Compose them to mirror the real layout while data loads.
