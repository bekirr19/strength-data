Spring dialog or slide-up bottom sheet on a translucent slate scrim — closes on scrim click / Escape.

```jsx
<Modal open={open} onClose={close} variant="sheet" eyebrow="Edit" title="Bench Press"
  footer={<Button variant="primary" fullWidth size="lg">Save</Button>}>
  …fields…
</Modal>
<Modal open={confirm} onClose={close} variant="dialog" title="Delete account?" subtitle="This can't be undone." />
```

`variant="sheet"` slides up with a grab handle; `"dialog"` springs in centered. Use `contained={false}` for a full-window overlay (default is `true`, anchored inside a device frame).
