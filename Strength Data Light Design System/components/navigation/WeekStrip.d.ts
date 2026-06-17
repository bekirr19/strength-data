import * as React from 'react';

export type Category = 'push' | 'pull' | 'leg' | 'other';

export interface WeekStripDay {
  /** ISO date — accepts `iso` or `dateISO`. */
  iso?: string;
  dateISO?: string;
  /** Short weekday label (e.g. "Mon") — accepts `wd` or `dow`. */
  wd?: string;
  dow?: string;
  /** Date number — accepts `d` or `day`. */
  d?: number | string;
  day?: number | string;
  /** Workout category; renders a colored dot when present. */
  category?: Category | null;
  /** Marks today — accepts `today` or `isToday`. */
  today?: boolean;
  isToday?: boolean;
}

/**
 * @startingPoint section="Navigation" subtitle="Swipeable week strip with a sliding pill" viewport="440x80"
 */
export interface WeekStripProps {
  days: WeekStripDay[];
  selectedISO?: string;
  onSelect?: (iso: string) => void;
  className?: string;
  style?: React.CSSProperties;
}

/** Draggable 7-day strip with a sliding accent pill and category dots. */
export function WeekStrip(props: WeekStripProps): React.JSX.Element;
