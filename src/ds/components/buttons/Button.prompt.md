Primary action button — blue primary, white-bordered secondary, ghost, and danger variants in sm/md/lg.

```jsx
<Button variant="primary" icon={<Plus size={18} />} onClick={save}>Add Exercise</Button>
<Button variant="secondary">Cancel</Button>
<Button variant="primary" fullWidth trailingIcon={<ArrowRight size={16} />}>Sign in</Button>
```

Variants: `primary` (filled blue + soft glow), `secondary` (white + hairline border), `ghost` (text only), `danger` (red tint). Sizes `sm | md | lg`. Pass `fullWidth` for form submits. Use `icon` / `trailingIcon` with Lucide nodes.
