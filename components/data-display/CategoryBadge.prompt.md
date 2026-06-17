Workout/exercise category tint — push=orange, pull=blue, leg=indigo, other=gray.

```jsx
<CategoryBadge category="push" />
<CategoryBadge category="pull" dot />
<CategoryBadge category="leg" label="Upper" onClick={jumpPrev} />
```

`label` overrides the text for combos (Upper/Full) while keeping a colour. `dot` adds a colour dot; `onClick` makes it a button. `CATEGORY_COLORS` is exported for custom use.
