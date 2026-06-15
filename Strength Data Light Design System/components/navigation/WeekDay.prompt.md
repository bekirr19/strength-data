A single day cell in the horizontal week strip; tinted by workout category, ringed when selected.

```jsx
<WeekDay weekday="Mon" day={12} category="push" onClick={pick} />
<WeekDay weekday="Wed" day={14} category="leg" caption="Leg" selected />
<WeekDay weekday="Fri" day={16} today />
```

Lay cells in a horizontal, scroll-snapping `.sd-no-scrollbar` flex row. `category` tints days with a workout; `caption` shows the combo type.
