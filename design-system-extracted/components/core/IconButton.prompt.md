Square or circular control wrapping a single icon — used for the map type toggle, panel close, and the reopen tab.

```jsx
<IconButton variant="panel" round><X size={16} /></IconButton>
<IconButton variant="ghost" active><Layers size={16} /></IconButton>
```

Variants: `ghost`, `panel` (glass/blur over the map), `solid`. Sizes `sm` (28) / `md` (36) / `lg` (44, min touch target). `round` for circular, `active` for selected.
