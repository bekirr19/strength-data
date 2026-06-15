Text field with optional leading icon and trailing slot; hairline border with a blue focus ring.

```jsx
<Input icon={<Mail size={18} />} placeholder="Email address" type="email" value={email} onChange={e => setEmail(e.target.value)} />
<Input icon={<Search size={18} />} placeholder="Search exercises…" />
<Input type="password" icon={<Lock size={18} />} trailing={<IconButton ariaLabel="Show"><Eye size={18}/></IconButton>} />
```

Compose `trailing` with an IconButton for password show/hide. Pass `inputMode="decimal"` for numeric entry.
