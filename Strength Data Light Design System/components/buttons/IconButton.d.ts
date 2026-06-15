import * as React from 'react';

export interface IconButtonProps {
  children?: React.ReactNode;
  /** @default "ghost" */
  variant?: 'ghost' | 'soft' | 'outline' | 'accent';
  /** @default "md" */
  size?: 'sm' | 'md' | 'lg';
  /** @default "rounded" */
  shape?: 'rounded' | 'circle';
  disabled?: boolean;
  ariaLabel?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  style?: React.CSSProperties;
}

/** Square or circular control holding a single icon (header actions, steppers, close). */
export function IconButton(props: IconButtonProps): React.JSX.Element;
