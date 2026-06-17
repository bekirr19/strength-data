import React from 'react';

/**
 * Modal — spring dialog (scale+fade on a translucent slate scrim) or a
 * slide-up bottom sheet with a grab handle. Matches the kit's Exercise
 * Picker / Quick-Edit sheet pattern. Closes on scrim click or Escape.
 */
export function Modal({
  open,
  onClose,
  title,
  subtitle,
  eyebrow,
  headerRight = null,
  variant = 'sheet',
  children,
  footer = null,
  maxWidth = 420,
  contained = true,
}) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose && onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  const isSheet = variant === 'sheet';

  return (
    <div
      style={{
        position: contained ? 'absolute' : 'fixed',
        inset: 0,
        zIndex: 60,
        display: 'flex',
        alignItems: isSheet ? 'flex-end' : 'center',
        justifyContent: 'center',
        padding: isSheet ? 0 : 18,
      }}
    >
      <div
        onClick={onClose}
        style={{ position: 'absolute', inset: 0, background: 'rgba(31,41,55,0.34)', animation: 'sd-fade-in var(--dur-base) var(--ease-standard)' }}
      />
      <div
        role="dialog"
        aria-modal="true"
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: isSheet ? '100%' : maxWidth,
          maxHeight: isSheet ? '86%' : '88%',
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--surface-card)',
          borderRadius: isSheet ? 'var(--radius-2xl) var(--radius-2xl) 0 0' : 'var(--radius-2xl)',
          boxShadow: 'var(--shadow-xl)',
          paddingBottom: 16,
          animation: isSheet
            ? 'sd-sheet-up var(--dur-slow) var(--ease-out)'
            : 'sd-pop-in var(--dur-slow) var(--ease-spring)',
        }}
      >
        {isSheet && (
          <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 10 }}>
            <div style={{ width: 38, height: 4, borderRadius: 2, background: 'var(--gray-200)' }} />
          </div>
        )}
        {(title || headerRight) && (
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, padding: isSheet ? '12px 18px 14px' : '18px 18px 14px' }}>
            <div>
              {eyebrow && <div className="sd-eyebrow" style={{ color: 'var(--accent)', marginBottom: 4 }}>{eyebrow}</div>}
              {title && <h3 style={{ margin: 0, fontSize: 'var(--text-xl)', fontWeight: 800, letterSpacing: '-0.01em', color: 'var(--text-primary)' }}>{title}</h3>}
              {subtitle && <p style={{ margin: '3px 0 0', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>{subtitle}</p>}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>{headerRight}</div>
          </div>
        )}
        <div className="sd-no-scrollbar" style={{ overflowY: 'auto', padding: '0 18px', flex: '0 1 auto' }}>
          {children}
        </div>
        {footer && <div style={{ padding: '14px 18px 0' }}>{footer}</div>}
      </div>
    </div>
  );
}
