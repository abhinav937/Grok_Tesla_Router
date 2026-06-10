import * as React from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Bordered well (focus → blue ring) vs. borderless inside a composer surface. */
  framed?: boolean;
  rows?: number;
}

/** Natural-language trip input. Borderless by default; `framed` for a bordered well. */
export function Textarea(props: TextareaProps): JSX.Element;
