Floating pill bottom navigation — icon tabs around a prominent circular **FAB** rendered in the centre. Fixed bottom on mobile.

```jsx
// Legacy API — `primary` becomes the centre FAB, inserted between the tabs:
<BottomNav
  activeKey="today"
  onSelect={setTab}
  items={[
    { key:'today', label:'Today', icon:<CalendarDays size={22}/> },
    { key:'exercises', label:'Exercises', icon:<Dumbbell size={22}/> },
  ]}
  primary={{ label:'Add', icon:<Plus size={26}/>, onClick:openPicker }}
/>

// Or declare the FAB inline with `fab:true` to control its position:
<BottomNav activeKey="today" onSelect={go} items={[
  { key:'today', label:'Today', icon:<Home size={22}/> },
  { key:'add', label:'Add', icon:<Plus size={26}/>, fab:true },
  { key:'exercises', label:'Exercises', icon:<Dumbbell size={22}/> },
]} />
```

The active tab turns accent; tabs press-scale, the FAB carries the accent glow and darkens on hover. Position it yourself: `position:fixed; left/right:16px; bottom:16px` (centre + max-width on desktop).
