import * as React from 'react';

export interface SwitchProps {
  /** On/off state. */
  checked?: boolean;
  /** Called with the next boolean value. */
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/** Compact toggle — accent-cyan track when on, knob slides with ease-out. */
export function Switch(props: SwitchProps): JSX.Element;
