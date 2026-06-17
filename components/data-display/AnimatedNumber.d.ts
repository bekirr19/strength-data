import * as React from 'react';

export interface AnimatedNumberProps {
  value: number;
  /** Count-up duration in ms. @default 900 */
  duration?: number;
  /** @default 0 */
  decimals?: number;
  prefix?: string;
  suffix?: string;
  /** Thousands-separate with toLocaleString. @default true */
  format?: boolean;
  style?: React.CSSProperties;
}

/** Count-up / roll to a target value with tabular figures. */
export function AnimatedNumber(props: AnimatedNumberProps): React.JSX.Element;
