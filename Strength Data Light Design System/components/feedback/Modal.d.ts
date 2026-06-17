import * as React from 'react';

export interface ModalProps {
  open: boolean;
  onClose?: () => void;
  title?: string;
  subtitle?: string;
  eyebrow?: string;
  headerRight?: React.ReactNode;
  /** @default "sheet" */
  variant?: 'dialog' | 'sheet';
  children?: React.ReactNode;
  /** Sticky footer slot (e.g. a primary Button). */
  footer?: React.ReactNode;
  /** Max width for dialog variant. @default 420 */
  maxWidth?: number;
  /** Position absolute (inside a device frame) vs fixed (full window). @default true */
  contained?: boolean;
}

/**
 * Spring dialog or slide-up bottom sheet on a translucent slate scrim.
 *
 * @startingPoint section="Feedback" subtitle="Dialog & bottom-sheet modal" viewport="420x420"
 */
export function Modal(props: ModalProps): React.JSX.Element | null;
