Compact "reps × weight" pill from a logged set, with PR highlighting.

```jsx
<SetChip reps={8} weight={60} />
<SetChip reps={5} weight="BW+10" />
<SetChip reps={6} weight={100} pr="new" trophy={<Trophy size={11}/>} />
```

`pr="new"` = gold, `pr="tied"` = cyan (pass a `trophy` node). Weight accepts a number or bodyweight notation ("BW", "BW+5").
