Slide-in notification (success / error / info) with auto-dismiss via the `useToasts` hook.

```jsx
const { push, ToastDock } = useToasts();
// …
<ToastDock renderIcon={(t) => <Icon name={t.tone === 'success' ? 'CheckCircle2' : 'Info'} size={16} />} />
<Button onClick={() => push({ tone:'success', title:'Saved', message:'Workout updated.' })}>Save</Button>
```

Render `<ToastDock/>` once per screen. `push({tone,title,message,icon,duration})` returns an id; `duration:0` persists. You can also render `<Toast>` directly.
