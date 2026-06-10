Core surface, 12px corners. `card` is the solid content card; `well` is an inset 4%-white row for summaries/metadata; `glass` is a blurred floating panel over the map.

```jsx
<Card elevation="card">…stop details…</Card>
<Card elevation="well" padding="sm">15h 20m · 1,042 mi</Card>
<Card elevation="glass">…floating input…</Card>
<Card accent>…Grok trip notes…</Card>
```

`accent` applies the faint-blue trip-notes wash. `padding`: none / sm / md / lg.
