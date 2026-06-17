import React from 'react';

/**
 * Toast — slide-in notification (success / error / info). Use the
 * useToasts() hook for a self-managing dock with auto-dismiss, or render
 * <Toast> directly. Status tokens: green / red / accent.
 */
const TONES = {
  success: { icon: 'CheckCircle2', bar: 'var(--green-500)', tint: 'var(--green-tint)' },
  error: { icon: 'AlertCircle', bar: 'var(--red-500)', tint: 'var(--red-tint)' },
  info: { icon: 'Info', bar: 'var(--accent)', tint: 'var(--accent-tint)' },
};

export function Toast({ tone = 'info', title, message, icon = null, onClose, style = {} }) {
  const t = TONES[tone] || TONES.info;
  return (
    <div
      role="status"
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 10,
        width: '100%',
        padding: '12px 14px',
        background: 'var(--surface-card)',
        border: '1px solid var(--border-subtle)',
        borderLeft: `3px solid ${t.bar}`,
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-lg)',
        animation: 'sd-toast-in var(--dur-slow) var(--ease-out)',
        ...style,
      }}
    >
      <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24, borderRadius: 'var(--radius-sm)', background: t.tint, color: t.bar, flexShrink: 0, marginTop: 1 }}>
        {icon}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        {title && <div style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--text-primary)' }}>{title}</div>}
        {message && <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginTop: title ? 1 : 0 }}>{message}</div>}
      </div>
      {onClose && (
        <button onClick={onClose} aria-label="Dismiss" style={{ border: 'none', background: 'none', padding: 2, cursor: 'pointer', color: 'var(--text-tertiary)', flexShrink: 0 }}>×</button>
      )}
    </div>
  );
}

/**
 * useToasts — returns { toasts, push, dismiss, ToastDock }.
 * push({ tone, title, message, icon, duration }) shows a toast that
 * auto-dismisses. Render <ToastDock/> once near the top of your screen.
 */
export function useToasts(defaultDuration = 2600) {
  const [toasts, setToasts] = React.useState([]);
  const dismiss = React.useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), []);
  const push = React.useCallback((toast) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { ...toast, id }]);
    const dur = toast.duration || defaultDuration;
    if (dur > 0) setTimeout(() => dismiss(id), dur);
    return id;
  }, [defaultDuration, dismiss]);

  const ToastDock = React.useCallback(({ renderIcon }) => (
    <div style={{ position: 'absolute', top: 12, left: 12, right: 12, zIndex: 80, display: 'flex', flexDirection: 'column', gap: 8, pointerEvents: 'none' }}>
      {toasts.map((t) => (
        <div key={t.id} style={{ pointerEvents: 'auto' }}>
          <Toast tone={t.tone} title={t.title} message={t.message} icon={t.icon || (renderIcon ? renderIcon(t) : null)} onClose={() => dismiss(t.id)} />
        </div>
      ))}
    </div>
  ), [toasts, dismiss]);

  return { toasts, push, dismiss, ToastDock };
}
