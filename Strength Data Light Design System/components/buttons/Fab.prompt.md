Floating action button — circular FAB or extended labelled pill, carrying the accent glow.

```jsx
<Fab extended icon={<Plus size={22} />} onClick={openPicker}>Add Exercise</Fab>
<Fab icon={<Plus size={22} />} ariaLabel="New exercise" />
```

`extended` renders a pill with a label (the bottom-nav primary). Without it you get a 52px circular FAB (the exercises-list "New Exercise" button).
