import * as React from 'react';

export interface SetChipProps {
  reps: number | string;
  /** Number ("60") or bodyweight notation ("BW", "BW+5"). */
  weight: number | string;
  /** @default "kg" */
  unit?: string;
  /** PR state — "new" = gold, "tied" = cyan. @default "none" */
  pr?: 'none' | 'new' | 'tied';
  /** Trophy icon node shown when pr is new/tied. */
  trophy?: React.ReactNode;
  style?: React.CSSProperties;
}

/** Compact "reps × weight" pill from a logged set, with PR highlighting. */
export function SetChip(props: SetChipProps): React.JSX.Element;
