import * as React from 'react';

export type SegOption = string | { value: string; label: React.ReactNode };

export interface SegmentedControlProps {
  options: SegOption[];
  value?: string;
  onChange?: (value: string) => void;
  /** @default "md" */
  size?: 'sm' | 'md';
  /** Active-segment text colour (pass a category token for tinted tabs). @default "var(--accent)" */
  accent?: string;
  /** Stretch segments to fill width. @default true */
  fill?: boolean;
  style?: React.CSSProperties;
}

/** Pill of mutually-exclusive options on a sunken track (metric/range/filter toggles). */
export function SegmentedControl(props: SegmentedControlProps): React.JSX.Element;
