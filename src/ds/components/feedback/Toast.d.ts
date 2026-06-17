import * as React from 'react';

export type ToastTone = 'success' | 'error' | 'info';

export interface ToastProps {
  /** @default "info" */
  tone?: ToastTone;
  title?: string;
  message?: string;
  icon?: React.ReactNode;
  onClose?: () => void;
  style?: React.CSSProperties;
}

/** Slide-in notification card (success / error / info). */
export function Toast(props: ToastProps): React.JSX.Element;

export interface ToastInput {
  tone?: ToastTone;
  title?: string;
  message?: string;
  icon?: React.ReactNode;
  /** ms before auto-dismiss; 0 = persist. */
  duration?: number;
}

export interface UseToastsResult {
  toasts: Array<ToastInput & { id: string }>;
  push: (toast: ToastInput) => string;
  dismiss: (id: string) => void;
  ToastDock: (props: { renderIcon?: (t: ToastInput) => React.ReactNode }) => React.JSX.Element;
}

/** Self-managing toast dock with auto-dismiss. Render <ToastDock/> once per screen. */
export function useToasts(defaultDuration?: number): UseToastsResult;
