import * as React from 'react';

export interface StepperProps {
  value?: string | number;
  onDecrement?: () => void;
  onIncrement?: () => void;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  /** Small uppercase caption above the control (e.g. "kg", "Reps"). */
  label?: string;
  /** Allow typing in the centre field. @default true */
  editable?: boolean;
  width?: string | number;
  style?: React.CSSProperties;
}

/** Weight/reps stepper with -/＋ around a centered, bodyweight-aware value. */
export function Stepper(props: StepperProps): React.JSX.Element;
