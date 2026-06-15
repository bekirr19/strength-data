Floating pill bottom navigation — icon tabs plus a prominent primary action. Fixed bottom on mobile.

```jsx
<BottomNav
  activeKey="today"
  onSelect={setTab}
  items={[
    { key:'today', label:'Today', icon:<CalendarDays size={20}/> },
    { key:'exercises', label:'Exercises', icon:<ListChecks size={20}/> },
  ]}
  primary={{ label:'Add Exercise', icon:<Plus size={20}/>, onClick:openPicker }}
/>
```

Position it yourself: `position:fixed; left/right:16px; bottom:16px` (centre + max-width on desktop).
