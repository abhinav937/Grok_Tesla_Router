Multiline text input — the natural-language trip composer. Borderless by default so it sits flush inside the floating glass input; `framed` gives it a bordered well with a blue focus ring.

```jsx
<Textarea placeholder="Madison WI to Austin TX, BBQ stop in Kansas City…" rows={3} />
<Textarea framed placeholder="Notes…" />
```

Placeholder uses `--text-faint`. Cmd/Ctrl+Enter submit is wired by the consumer.
