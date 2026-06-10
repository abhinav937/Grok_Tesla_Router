Compact controlled toggle — accent-cyan track when on, knob slides with the ease-out curve. Used for settings like map type, units, scenic-priority.

```jsx
const [on, setOn] = React.useState(false);
<Switch checked={on} onChange={setOn} />
```
