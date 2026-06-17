import * as React from 'react';

export type WorkoutType = 'push' | 'pull' | 'leg' | 'other' | 'upper' | 'legPush' | 'legPull' | 'full';

export interface WorkoutTypeBadgeProps {
  /** Explicit type key. */
  type?: WorkoutType;
  /** Or derive from a focus array (subset of push/pull/leg). */
  focus?: Array<'push' | 'pull' | 'leg'>;
  /** Override the label text. */
  label?: string;
  dot?: boolean;
  /** @default "md" */
  size?: 'sm' | 'md';
  onClick?: () => void;
  style?: React.CSSProperties;
}

export declare const WORKOUT_TYPE_COLORS: Record<WorkoutType, { tint: string; fg: string; dot: string; label: string }>;
export declare function workoutTypeOf(focus?: Array<'push' | 'pull' | 'leg'>): WorkoutType;

/** Workout-focus badge: single focuses + combos (Upper, Leg+Push, Leg+Pull, Full Body). */
export function WorkoutTypeBadge(props: WorkoutTypeBadgeProps): React.JSX.Element;
