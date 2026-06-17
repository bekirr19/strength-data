import * as React from 'react';

export interface AvatarProps {
  src?: string;
  name?: string;
  /** Pixel diameter. @default 40 */
  size?: number;
  /** Fallback icon when no src/name. */
  icon?: React.ReactNode;
  style?: React.CSSProperties;
}

/** Round user chip — photo, initial, or fallback icon. */
export function Avatar(props: AvatarProps): React.JSX.Element;
