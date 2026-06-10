Pill label. The `stop` prop produces the tinted stop-type chips that mirror the route markers; otherwise pick a `tone` + `variant`.

```jsx
<Badge stop="food" icon={<Utensils size={10} />}>Food</Badge>
<Badge stop="charging" icon={<Zap size={10} />}>Charging</Badge>
<Badge tone="accent" variant="subtle">GROK 3</Badge>
<Badge tone="accent" uppercase icon={<Sunrise size={11} />}>Day 1</Badge>
```

Stop types: `food` (amber), `charging` (green), `scenic` (sky), `rest` (violet), `attraction` (gold). Variants `solid` / `subtle` / `outline`; tones `accent` / `neutral` / `success` / `danger`. `uppercase` adds wide tracking for section labels.
