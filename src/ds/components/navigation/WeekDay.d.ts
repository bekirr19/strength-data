import * as React from 'react';

export type Category = 'push' | 'pull' | 'leg' | 'other';

export interface WeekDayProps {
  /** Short weekday label (e.g. "Mon"). */
  weekday: string;
  /** Date number. */
  day: number | string;
  /** Workout category tint, if a workout exists that day. */
  category?: Category | null;
  selected?: boolean;
  today?: boolean;
  /** Tiny caption under the number (combo type, e.g. "Upper"). */
  caption?: string | null;
  onClick?: () => void;
  style?: React.CSSProperties;
}

/** A single day cell in the horizontal week strip. */
export function WeekDay(props: WeekDayProps): React.JSX.Element;
