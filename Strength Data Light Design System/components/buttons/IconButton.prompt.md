Square or circular icon-only control for header actions, modal close, steppers, and edit affordances.

```jsx
<IconButton ariaLabel="Edit" variant="soft"><Pencil size={18} /></IconButton>
<IconButton ariaLabel="Close" variant="ghost" shape="circle"><X size={20} /></IconButton>
```

Variants: `ghost`, `soft` (gray fill), `outline` (white + border), `accent` (blue tint). `shape="circle"` for avatars/close; default rounded square. Always pass `ariaLabel`.
