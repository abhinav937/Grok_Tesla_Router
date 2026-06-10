Pill-shaped action button — the electric-blue `primary` carries the main action; `white` is the single highest-emphasis CTA on a surface (e.g. "Open in Google Maps").

```jsx
<Button variant="primary" icon={<Zap size={14} fill="currentColor" />}>Plan route</Button>
<Button variant="white" size="lg" icon={<Navigation size={16} />}>Open in Google Maps</Button>
<Button variant="ghost" size="sm">New trip</Button>
```

Variants: `primary` (blue, black text → hover darkens to blue-dark + white text), `white` (CTA), `secondary` / `outline` (bordered, subtle), `ghost` (transparent), `destructive` (Tesla red). Sizes `sm` / `md` / `lg`. Press shrinks to 0.98. Set `pill={false}` for soft 10px corners.
