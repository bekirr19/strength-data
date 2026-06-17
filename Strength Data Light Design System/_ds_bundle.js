/* @ds-bundle: {"format":3,"namespace":"StrengthDataDesignSystem_5c629b","components":[{"name":"Button","sourcePath":"components/buttons/Button.jsx"},{"name":"Fab","sourcePath":"components/buttons/Fab.jsx"},{"name":"IconButton","sourcePath":"components/buttons/IconButton.jsx"},{"name":"Badge","sourcePath":"components/data-display/Badge.jsx"},{"name":"CATEGORY_COLORS","sourcePath":"components/data-display/CategoryBadge.jsx"},{"name":"CategoryBadge","sourcePath":"components/data-display/CategoryBadge.jsx"},{"name":"SetChip","sourcePath":"components/data-display/SetChip.jsx"},{"name":"StatCard","sourcePath":"components/data-display/StatCard.jsx"},{"name":"Input","sourcePath":"components/forms/Input.jsx"},{"name":"SegmentedControl","sourcePath":"components/forms/SegmentedControl.jsx"},{"name":"Stepper","sourcePath":"components/forms/Stepper.jsx"},{"name":"Avatar","sourcePath":"components/layout/Avatar.jsx"},{"name":"Card","sourcePath":"components/layout/Card.jsx"},{"name":"BottomNav","sourcePath":"components/navigation/BottomNav.jsx"},{"name":"WeekDay","sourcePath":"components/navigation/WeekDay.jsx"},{"name":"WeekStrip","sourcePath":"components/navigation/WeekStrip.jsx"}],"sourceHashes":{"components/buttons/Button.jsx":"620ae24058c5","components/buttons/Fab.jsx":"6e3fdc87116d","components/buttons/IconButton.jsx":"e0f4de12d58b","components/data-display/Badge.jsx":"ca7636fecdb7","components/data-display/CategoryBadge.jsx":"986802907ac0","components/data-display/SetChip.jsx":"e936b5886e21","components/data-display/StatCard.jsx":"5a96c203db15","components/forms/Input.jsx":"3846c97e5160","components/forms/SegmentedControl.jsx":"0442b92b2454","components/forms/Stepper.jsx":"49267bdb35e0","components/layout/Avatar.jsx":"7b58e626eeb6","components/layout/Card.jsx":"f1f90065dff5","components/navigation/BottomNav.jsx":"ec8c4a1fbe17","components/navigation/WeekDay.jsx":"b713fffd1dd3","ui_kits/strength-data/Chart.jsx":"d3f1f5380726","ui_kits/strength-data/data.jsx":"c4ae8630acef","ui_kits/strength-data/screens-auth-today.jsx":"2daf5d7535a5","ui_kits/strength-data/screens-detail-profile.jsx":"8dac5e622788","ui_kits/strength-data/screens-workout-exercises.jsx":"ae2a897a1c4a"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.StrengthDataDesignSystem_5c629b = window.StrengthDataDesignSystem_5c629b || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/buttons/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Button — primary action control for Strength Data.
 * Variants: primary (blue), secondary (white + border), ghost, danger.
 * Sizes: sm, md, lg. Optional leading/trailing icon and full-width.
 */
function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon = null,
  trailingIcon = null,
  fullWidth = false,
  disabled = false,
  type = 'button',
  onClick,
  style = {},
  ...rest
}) {
  const sizes = {
    sm: {
      padding: '0 14px',
      height: 36,
      font: 'var(--text-xs)',
      radius: 'var(--radius-md)',
      gap: 6
    },
    md: {
      padding: '0 18px',
      height: 44,
      font: 'var(--text-sm)',
      radius: 'var(--radius-md)',
      gap: 8
    },
    lg: {
      padding: '0 24px',
      height: 52,
      font: 'var(--text-base)',
      radius: 'var(--radius-lg)',
      gap: 8
    }
  };
  const s = sizes[size] || sizes.md;
  const variants = {
    primary: {
      background: 'var(--accent)',
      color: 'var(--text-on-accent)',
      border: '1px solid transparent',
      boxShadow: 'var(--shadow-accent-sm)'
    },
    secondary: {
      background: 'var(--surface-card)',
      color: 'var(--text-primary)',
      border: '1px solid var(--border-subtle)',
      boxShadow: 'var(--shadow-xs)'
    },
    ghost: {
      background: 'transparent',
      color: 'var(--text-secondary)',
      border: '1px solid transparent',
      boxShadow: 'none'
    },
    danger: {
      background: 'var(--red-tint)',
      color: 'var(--red-600)',
      border: '1px solid transparent',
      boxShadow: 'none'
    }
  };
  const v = variants[variant] || variants.primary;
  return /*#__PURE__*/React.createElement("button", _extends({
    type: type,
    disabled: disabled,
    onClick: onClick,
    className: "sd-focus-ring",
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: s.gap,
      height: s.height,
      padding: s.padding,
      width: fullWidth ? '100%' : 'auto',
      fontFamily: 'var(--font-sans)',
      fontSize: s.font,
      fontWeight: 'var(--weight-bold)',
      lineHeight: 1,
      borderRadius: s.radius,
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1,
      transition: 'background var(--dur-fast) var(--ease-standard), transform var(--dur-fast) var(--ease-standard), box-shadow var(--dur-fast) var(--ease-standard)',
      WebkitTapHighlightColor: 'transparent',
      ...v,
      ...style
    },
    onMouseDown: e => {
      if (!disabled) e.currentTarget.style.transform = 'scale(0.98)';
    },
    onMouseUp: e => {
      e.currentTarget.style.transform = 'scale(1)';
    },
    onMouseLeave: e => {
      e.currentTarget.style.transform = 'scale(1)';
    }
  }, rest), icon && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      flexShrink: 0
    }
  }, icon), children, trailingIcon && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      flexShrink: 0
    }
  }, trailingIcon));
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/buttons/Button.jsx", error: String((e && e.message) || e) }); }

// components/buttons/Fab.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Fab — floating action button. Either a pill with a label (the "Add Exercise"
 * primary in the bottom nav) or a circular FAB (the "New Exercise" on the
 * exercises list). Carries the accent glow.
 */
function Fab({
  children,
  icon = null,
  extended = false,
  onClick,
  ariaLabel,
  style = {},
  ...rest
}) {
  return /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    "aria-label": ariaLabel,
    onClick: onClick,
    className: "sd-focus-ring",
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: extended ? 8 : 0,
      height: 52,
      width: extended ? 'auto' : 52,
      padding: extended ? '0 22px' : 0,
      background: 'var(--accent)',
      color: 'var(--text-on-accent)',
      border: 'none',
      borderRadius: 'var(--radius-full)',
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--text-sm)',
      fontWeight: 'var(--weight-bold)',
      boxShadow: 'var(--shadow-accent)',
      cursor: 'pointer',
      transition: 'background var(--dur-fast) var(--ease-standard), transform var(--dur-fast) var(--ease-standard)',
      WebkitTapHighlightColor: 'transparent',
      ...style
    },
    onMouseDown: e => {
      e.currentTarget.style.transform = 'scale(0.97)';
    },
    onMouseUp: e => {
      e.currentTarget.style.transform = 'scale(1)';
    },
    onMouseLeave: e => {
      e.currentTarget.style.transform = 'scale(1)';
    }
  }, rest), icon && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      flexShrink: 0
    }
  }, icon), extended && children);
}
Object.assign(__ds_scope, { Fab });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/buttons/Fab.jsx", error: String((e && e.message) || e) }); }

// components/buttons/IconButton.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * IconButton — square/circular control holding a single icon.
 * Used for header actions, modal close, steppers, edit affordances.
 */
function IconButton({
  children,
  variant = 'ghost',
  size = 'md',
  shape = 'rounded',
  disabled = false,
  ariaLabel,
  onClick,
  style = {},
  ...rest
}) {
  const sizes = {
    sm: 32,
    md: 40,
    lg: 44
  };
  const dim = sizes[size] || sizes.md;
  const variants = {
    ghost: {
      background: 'transparent',
      color: 'var(--text-secondary)',
      border: '1px solid transparent'
    },
    soft: {
      background: 'var(--surface-sunken)',
      color: 'var(--text-primary)',
      border: '1px solid transparent'
    },
    outline: {
      background: 'var(--surface-card)',
      color: 'var(--text-primary)',
      border: '1px solid var(--border-subtle)'
    },
    accent: {
      background: 'var(--accent-tint)',
      color: 'var(--accent-hover)',
      border: '1px solid transparent'
    }
  };
  const v = variants[variant] || variants.ghost;
  return /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    "aria-label": ariaLabel,
    disabled: disabled,
    onClick: onClick,
    className: "sd-focus-ring",
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: dim,
      height: dim,
      flexShrink: 0,
      borderRadius: shape === 'circle' ? 'var(--radius-full)' : 'var(--radius-md)',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.45 : 1,
      transition: 'background var(--dur-fast) var(--ease-standard), color var(--dur-fast) var(--ease-standard)',
      WebkitTapHighlightColor: 'transparent',
      ...v,
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { IconButton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/buttons/IconButton.jsx", error: String((e && e.message) || e) }); }

// components/data-display/Badge.jsx
try { (() => {
/**
 * Badge — small status/label pill. Tone sets the tint; `solid` fills it.
 * Use CategoryBadge for the push/pull/leg/other workout tints.
 */
function Badge({
  children,
  tone = 'neutral',
  solid = false,
  icon = null,
  style = {}
}) {
  const tones = {
    neutral: {
      tint: 'var(--surface-sunken)',
      fg: 'var(--text-secondary)',
      solidBg: 'var(--gray-500)'
    },
    blue: {
      tint: 'var(--blue-50)',
      fg: 'var(--blue-700)',
      solidBg: 'var(--blue-500)'
    },
    green: {
      tint: 'var(--green-tint)',
      fg: 'var(--green-500)',
      solidBg: 'var(--green-500)'
    },
    gold: {
      tint: 'var(--gold-tint)',
      fg: 'var(--gold-500)',
      solidBg: 'var(--gold-500)'
    },
    cyan: {
      tint: 'var(--cyan-tint)',
      fg: 'var(--cyan-500)',
      solidBg: 'var(--cyan-500)'
    },
    red: {
      tint: 'var(--red-tint)',
      fg: 'var(--red-600)',
      solidBg: 'var(--red-500)'
    }
  };
  const t = tones[tone] || tones.neutral;
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      height: 22,
      padding: '0 9px',
      borderRadius: 'var(--radius-full)',
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--text-2xs)',
      fontWeight: 'var(--weight-bold)',
      lineHeight: 1,
      letterSpacing: '0.01em',
      background: solid ? t.solidBg : t.tint,
      color: solid ? 'var(--white)' : t.fg,
      ...style
    }
  }, icon && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex'
    }
  }, icon), children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data-display/Badge.jsx", error: String((e && e.message) || e) }); }

// components/data-display/CategoryBadge.jsx
try { (() => {
/**
 * CategoryBadge — the workout / exercise category tint.
 * push = orange, pull = blue, leg = indigo, other = gray.
 * Also accepts combo labels (Upper / Full) via the `label` prop while
 * keeping a category colour. Subtle tinted background + coloured text.
 */
const CATEGORY_COLORS = {
  push: {
    tint: 'var(--push-tint)',
    fg: 'var(--push-700)',
    dot: 'var(--push-500)',
    label: 'Push'
  },
  pull: {
    tint: 'var(--pull-tint)',
    fg: 'var(--pull-700)',
    dot: 'var(--pull-500)',
    label: 'Pull'
  },
  leg: {
    tint: 'var(--leg-tint)',
    fg: 'var(--leg-700)',
    dot: 'var(--leg-500)',
    label: 'Leg'
  },
  other: {
    tint: 'var(--other-tint)',
    fg: 'var(--other-700)',
    dot: 'var(--other-500)',
    label: 'Other'
  }
};
function CategoryBadge({
  category = 'other',
  label,
  dot = false,
  size = 'md',
  onClick,
  style = {}
}) {
  const c = CATEGORY_COLORS[category] || CATEGORY_COLORS.other;
  const sizes = {
    sm: {
      h: 20,
      font: 'var(--text-3xs)',
      pad: '0 8px'
    },
    md: {
      h: 24,
      font: 'var(--text-2xs)',
      pad: '0 10px'
    }
  };
  const s = sizes[size] || sizes.md;
  const Tag = onClick ? 'button' : 'span';
  return /*#__PURE__*/React.createElement(Tag, {
    type: onClick ? 'button' : undefined,
    onClick: onClick,
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      height: s.h,
      padding: s.pad,
      border: 'none',
      borderRadius: 'var(--radius-full)',
      background: c.tint,
      color: c.fg,
      fontFamily: 'var(--font-sans)',
      fontSize: s.font,
      fontWeight: 'var(--weight-bold)',
      textTransform: 'uppercase',
      letterSpacing: '0.04em',
      cursor: onClick ? 'pointer' : 'default',
      WebkitTapHighlightColor: 'transparent',
      ...style
    }
  }, dot && /*#__PURE__*/React.createElement("span", {
    style: {
      width: 6,
      height: 6,
      borderRadius: '50%',
      background: c.dot,
      flexShrink: 0
    }
  }), label || c.label);
}
Object.assign(__ds_scope, { CATEGORY_COLORS, CategoryBadge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data-display/CategoryBadge.jsx", error: String((e && e.message) || e) }); }

// components/data-display/SetChip.jsx
try { (() => {
/**
 * SetChip — compact "reps × weight" pill from a logged set.
 * PR highlighting: pr="new" = gold, pr="tied" = cyan (both add a trophy).
 * Weight may be a number ("60") or bodyweight notation ("BW" / "BW+5").
 */
function SetChip({
  reps,
  weight,
  unit = 'kg',
  pr = 'none',
  trophy = null,
  style = {}
}) {
  const isBW = typeof weight === 'string' && weight.toUpperCase().startsWith('BW');
  const tones = {
    none: {
      bg: 'var(--surface-sunken)',
      border: 'var(--border-subtle)',
      repFg: 'var(--text-primary)',
      wFg: 'var(--text-secondary)'
    },
    new: {
      bg: 'var(--gold-tint)',
      border: 'rgba(245,158,11,0.30)',
      repFg: 'var(--gold-500)',
      wFg: 'var(--gold-500)'
    },
    tied: {
      bg: 'var(--cyan-tint)',
      border: 'rgba(6,182,212,0.30)',
      repFg: 'var(--cyan-500)',
      wFg: 'var(--cyan-500)'
    }
  };
  const t = tones[pr] || tones.none;
  return /*#__PURE__*/React.createElement("span", {
    className: "sd-tnum",
    style: {
      display: 'inline-flex',
      alignItems: 'baseline',
      gap: 3,
      padding: '3px 8px',
      background: t.bg,
      border: `1px solid ${t.border}`,
      borderRadius: 'var(--radius-sm)',
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--text-xs)',
      lineHeight: 1.2,
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 'var(--weight-bold)',
      color: t.repFg
    }
  }, reps), /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-tertiary)',
      fontSize: 'var(--text-3xs)',
      fontWeight: 600
    }
  }, "\xD7"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 'var(--weight-semibold)',
      color: t.wFg
    }
  }, isBW ? weight : `${weight}${unit ? ` ${unit}` : ''}`), pr !== 'none' && trophy && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      marginLeft: 1,
      color: t.wFg
    }
  }, trophy));
}
Object.assign(__ds_scope, { SetChip });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data-display/SetChip.jsx", error: String((e && e.message) || e) }); }

// components/data-display/StatCard.jsx
try { (() => {
/**
 * StatCard — a labelled metric tile (Best weight, Strength change, totals).
 * `tone="gold"` for the personal-best highlight, `trend` colours the value
 * green/red for +/- change.
 */
function StatCard({
  label,
  value,
  sub,
  icon = null,
  tone = 'default',
  trend = null,
  style = {}
}) {
  const tones = {
    default: {
      bg: 'var(--surface-card)',
      border: 'var(--border-subtle)',
      valueFg: 'var(--text-primary)',
      iconFg: 'var(--accent)'
    },
    gold: {
      bg: 'var(--gold-tint)',
      border: 'rgba(245,158,11,0.25)',
      valueFg: 'var(--gold-500)',
      iconFg: 'var(--gold-500)'
    }
  };
  const t = tones[tone] || tones.default;
  let valueColor = t.valueFg;
  if (trend === 'up') valueColor = 'var(--green-500)';
  if (trend === 'down') valueColor = 'var(--red-500)';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      padding: 16,
      background: t.bg,
      border: `1px solid ${t.border}`,
      borderRadius: 'var(--radius-lg)',
      boxShadow: tone === 'default' ? 'var(--shadow-xs)' : 'none',
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6
    }
  }, icon && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      color: t.iconFg
    }
  }, icon), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--text-3xs)',
      fontWeight: 'var(--weight-bold)',
      textTransform: 'uppercase',
      letterSpacing: 'var(--tracking-wide)',
      color: 'var(--text-secondary)'
    }
  }, label)), /*#__PURE__*/React.createElement("span", {
    className: "sd-tnum",
    style: {
      fontSize: 'var(--text-2xl)',
      fontWeight: 'var(--weight-extrabold)',
      lineHeight: 1.05,
      color: valueColor
    }
  }, value), sub && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--text-2xs)',
      color: 'var(--text-tertiary)'
    }
  }, sub));
}
Object.assign(__ds_scope, { StatCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data-display/StatCard.jsx", error: String((e && e.message) || e) }); }

// components/forms/Input.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Input — text field with optional leading icon and trailing slot.
 * Light fill, hairline border, blue focus ring. Used across auth, search,
 * exercise editing, and body-weight entry.
 */
function Input({
  value,
  onChange,
  placeholder,
  type = 'text',
  icon = null,
  trailing = null,
  disabled = false,
  inputMode,
  ariaLabel,
  style = {},
  inputStyle = {},
  ...rest
}) {
  const [focused, setFocused] = React.useState(false);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      height: 48,
      padding: '0 14px',
      background: 'var(--surface-card)',
      border: `1px solid ${focused ? 'var(--border-focus)' : 'var(--border-subtle)'}`,
      borderRadius: 'var(--radius-md)',
      boxShadow: focused ? '0 0 0 3px var(--ring)' : 'var(--shadow-xs)',
      transition: 'border-color var(--dur-fast) var(--ease-standard), box-shadow var(--dur-fast) var(--ease-standard)',
      opacity: disabled ? 0.6 : 1,
      ...style
    }
  }, icon && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      color: 'var(--text-tertiary)',
      flexShrink: 0
    }
  }, icon), /*#__PURE__*/React.createElement("input", _extends({
    type: type,
    value: value,
    onChange: onChange,
    placeholder: placeholder,
    disabled: disabled,
    inputMode: inputMode,
    "aria-label": ariaLabel,
    onFocus: () => setFocused(true),
    onBlur: () => setFocused(false),
    style: {
      flex: 1,
      minWidth: 0,
      border: 'none',
      outline: 'none',
      background: 'transparent',
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--text-sm)',
      fontWeight: 'var(--weight-medium)',
      color: 'var(--text-primary)',
      ...inputStyle
    }
  }, rest)), trailing && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      flexShrink: 0
    }
  }, trailing));
}
Object.assign(__ds_scope, { Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Input.jsx", error: String((e && e.message) || e) }); }

// components/forms/SegmentedControl.jsx
try { (() => {
if (typeof document !== 'undefined' && !document.getElementById('sd-segmented-css')) {
  const s = document.createElement('style');
  s.id = 'sd-segmented-css';
  s.textContent = `
.sd-segmented { position: relative; display: inline-flex; padding: 3px; background: var(--surface-sunken); border-radius: var(--radius-md); }
.sd-segmented--full { display: flex; width: 100%; }
.sd-segmented__pill { position: absolute; top: 3px; bottom: 3px; left: 3px; background: var(--surface-card); border-radius: calc(var(--radius-md) - 3px); box-shadow: var(--shadow-sm); transition: transform var(--dur-base) var(--ease-spring), width var(--dur-base) var(--ease-spring); z-index: 0; }
.sd-segmented__opt { position: relative; z-index: 1; flex: 1; min-width: 0; border: none; background: transparent; cursor: pointer; white-space: nowrap; font-family: var(--font-sans); font-weight: var(--weight-semibold); color: var(--text-secondary); transition: color var(--dur-fast) var(--ease-standard); -webkit-tap-highlight-color: transparent; }
.sd-segmented__opt:focus-visible { outline: none; box-shadow: 0 0 0 3px var(--ring); border-radius: var(--radius-sm); }
`;
  document.head.appendChild(s);
}
/**
 * SegmentedControl — sunken track with a single sliding pill that springs to the
 * active option. Metric toggle (Weight / 1RM / Volume), range tabs, etc.
 * `accent` colours the active label; `fill` stretches to full width.
 */
function SegmentedControl({
  options = [],
  value,
  onChange,
  size = 'md',
  accent = 'var(--accent)',
  fill = true,
  style = {}
}) {
  const sizes = {
    sm: {
      h: 30,
      font: 'var(--text-2xs)',
      pad: '0 12px'
    },
    md: {
      h: 38,
      font: 'var(--text-xs)',
      pad: '0 16px'
    }
  };
  const s = sizes[size] || sizes.md;
  const n = options.length || 1;
  const valOf = o => typeof o === 'string' ? o : o.value;
  const idx = Math.max(0, options.findIndex(o => valOf(o) === value));
  return /*#__PURE__*/React.createElement("div", {
    className: ['sd-segmented', fill ? 'sd-segmented--full' : ''].filter(Boolean).join(' '),
    role: "tablist",
    style: style
  }, /*#__PURE__*/React.createElement("span", {
    className: "sd-segmented__pill",
    style: {
      width: `calc((100% - 6px) / ${n})`,
      transform: `translateX(${idx * 100}%)`
    },
    "aria-hidden": "true"
  }), options.map(opt => {
    const val = valOf(opt);
    const label = typeof opt === 'string' ? opt : opt.label;
    const active = val === value;
    return /*#__PURE__*/React.createElement("button", {
      key: val,
      type: "button",
      role: "tab",
      "aria-selected": active,
      onClick: () => onChange && onChange(val),
      className: "sd-segmented__opt" + (active ? " sd-segmented__opt--active" : ""),
      style: {
        height: s.h,
        padding: s.pad,
        fontSize: s.font,
        color: active ? accent : 'var(--text-secondary)'
      }
    }, label);
  }));
}
Object.assign(__ds_scope, { SegmentedControl });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/SegmentedControl.jsx", error: String((e && e.message) || e) }); }

// components/forms/Stepper.jsx
try { (() => {
/**
 * Stepper — weight/reps editor with -/＋ buttons around a centered value.
 * Bodyweight-aware: the value can read "BW" or "BW+5" as well as a number.
 * Used in the Quick-Edit and Workout Detail set editors.
 */
function Stepper({
  value,
  onDecrement,
  onIncrement,
  onChange,
  label,
  editable = true,
  width = '100%',
  style = {}
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width,
      ...style
    }
  }, label && /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      fontSize: 'var(--text-3xs)',
      fontWeight: 'var(--weight-bold)',
      textTransform: 'uppercase',
      letterSpacing: 'var(--tracking-wide)',
      color: 'var(--text-tertiary)',
      marginBottom: 6
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement(StepBtn, {
    onClick: onDecrement,
    ariaLabel: "Decrease"
  }, "\u2212"), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      height: 40,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--surface-sunken)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-sm)'
    }
  }, /*#__PURE__*/React.createElement("input", {
    value: value,
    onChange: onChange,
    readOnly: !editable,
    inputMode: "decimal",
    onFocus: e => e.target.select(),
    style: {
      width: '100%',
      border: 'none',
      outline: 'none',
      background: 'transparent',
      textAlign: 'center',
      fontFamily: 'var(--font-sans)',
      fontVariantNumeric: 'tabular-nums',
      fontSize: 'var(--text-base)',
      fontWeight: 'var(--weight-bold)',
      color: 'var(--text-primary)'
    }
  })), /*#__PURE__*/React.createElement(StepBtn, {
    onClick: onIncrement,
    ariaLabel: "Increase"
  }, "+")));
}
function StepBtn({
  children,
  onClick,
  ariaLabel
}) {
  return /*#__PURE__*/React.createElement("button", {
    type: "button",
    "aria-label": ariaLabel,
    onClick: onClick,
    className: "sd-focus-ring",
    style: {
      width: 34,
      height: 40,
      flexShrink: 0,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--surface-card)',
      color: 'var(--text-secondary)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-sm)',
      fontSize: 'var(--text-lg)',
      fontWeight: 'var(--weight-bold)',
      lineHeight: 1,
      cursor: 'pointer',
      WebkitTapHighlightColor: 'transparent'
    }
  }, children);
}
Object.assign(__ds_scope, { Stepper });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Stepper.jsx", error: String((e && e.message) || e) }); }

// components/layout/Avatar.jsx
try { (() => {
/**
 * Avatar — round user chip. Shows a photo, an initial, or a fallback icon.
 * Used in the header profile button and the profile screen.
 */
function Avatar({
  src,
  name,
  size = 40,
  icon = null,
  style = {}
}) {
  const initial = name ? name.trim().charAt(0).toUpperCase() : null;
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: size,
      height: size,
      flexShrink: 0,
      borderRadius: 'var(--radius-full)',
      overflow: 'hidden',
      background: src ? 'transparent' : 'var(--accent-tint)',
      color: 'var(--accent-hover)',
      border: '1px solid var(--border-subtle)',
      fontFamily: 'var(--font-sans)',
      fontWeight: 'var(--weight-bold)',
      fontSize: Math.round(size * 0.4),
      ...style
    }
  }, src ? /*#__PURE__*/React.createElement("img", {
    src: src,
    alt: name || 'User',
    style: {
      width: '100%',
      height: '100%',
      objectFit: 'cover'
    }
  }) : initial ? initial : icon);
}
Object.assign(__ds_scope, { Avatar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/layout/Avatar.jsx", error: String((e && e.message) || e) }); }

// components/layout/Card.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Card — the white rounded surface that holds everything in Strength Data.
 * `pad` controls inner padding; `interactive` adds hover lift for tappable
 * rows. `tint` swaps the background for a subtle accent panel (fuel/notes).
 */
function Card({
  children,
  pad = 'lg',
  interactive = false,
  tint = null,
  as = 'div',
  onClick,
  style = {},
  ...rest
}) {
  const pads = {
    none: 0,
    sm: 12,
    md: 16,
    lg: 20,
    xl: 24
  };
  const tints = {
    accent: {
      bg: 'var(--accent-tint)',
      border: 'rgba(59,130,246,0.18)'
    },
    sunken: {
      bg: 'var(--surface-sunken)',
      border: 'var(--border-subtle)'
    },
    gold: {
      bg: 'var(--gold-tint)',
      border: 'rgba(245,158,11,0.22)'
    }
  };
  const t = tint ? tints[tint] : null;
  const Tag = as;
  const [hover, setHover] = React.useState(false);
  return /*#__PURE__*/React.createElement(Tag, _extends({
    onClick: onClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      background: t ? t.bg : 'var(--surface-card)',
      border: `1px solid ${t ? t.border : 'var(--border-subtle)'}`,
      borderRadius: 'var(--radius-2xl)',
      padding: pads[pad] ?? pads.lg,
      boxShadow: interactive && hover ? 'var(--shadow-md)' : 'var(--shadow-sm)',
      transform: interactive && hover ? 'translateY(-1px)' : 'none',
      transition: 'box-shadow var(--dur-base) var(--ease-standard), transform var(--dur-base) var(--ease-standard)',
      cursor: interactive ? 'pointer' : 'default',
      textAlign: 'left',
      width: '100%',
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/layout/Card.jsx", error: String((e && e.message) || e) }); }

// components/navigation/BottomNav.jsx
try { (() => {
if (typeof document !== 'undefined' && !document.getElementById('sd-bottomnav-css')) {
  const s = document.createElement('style');
  s.id = 'sd-bottomnav-css';
  s.textContent = `
.sd-bottomnav { display: flex; align-items: center; justify-content: space-around; gap: 4px; height: var(--nav-height); padding: 0 10px; background: var(--surface-card); border: 1px solid var(--border-subtle); border-radius: var(--radius-full); box-shadow: var(--shadow-lg); }
.sd-bottomnav__tab { display: inline-flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px; flex: 1; height: 48px; border: none; background: transparent; cursor: pointer; color: var(--text-tertiary); font-family: var(--font-sans); font-size: var(--text-xs); font-weight: var(--weight-medium); border-radius: var(--radius-md); transition: color var(--dur-fast) var(--ease-standard), transform var(--dur-fast) var(--ease-spring); -webkit-tap-highlight-color: transparent; }
.sd-bottomnav__tab:active { transform: scale(var(--press-scale)); }
.sd-bottomnav__tab--active { color: var(--accent); }
.sd-bottomnav__fab { display: inline-flex; align-items: center; justify-content: center; flex: none; width: 56px; height: 56px; margin: 0 4px; border: none; border-radius: 50%; cursor: pointer; background: var(--accent); color: var(--text-on-accent); box-shadow: var(--shadow-accent); transition: background var(--dur-fast) var(--ease-standard), transform var(--dur-fast) var(--ease-spring); -webkit-tap-highlight-color: transparent; }
.sd-bottomnav__fab:hover { background: var(--accent-hover); }
.sd-bottomnav__fab:active { transform: scale(0.92); }
.sd-bottomnav__fab:focus-visible, .sd-bottomnav__tab:focus-visible { outline: none; box-shadow: 0 0 0 3px var(--ring); }
`;
  document.head.appendChild(s);
}
/**
 * BottomNav — floating pill navigation with a central circular FAB.
 * `primary={{label,icon,onClick}}` (legacy) becomes the centre FAB; or mark an
 * item with `fab:true`. Tabs come from `items`; `activeKey` turns one accent.
 */
function BottomNav({
  items = [],
  primary = null,
  activeKey,
  onSelect,
  style = {}
}) {
  const tabs = items.filter(it => !it.fab);
  const inlineFab = items.find(it => it.fab) || null;
  const fab = primary || inlineFab;
  const renderTab = it => {
    const active = it.key === activeKey;
    return /*#__PURE__*/React.createElement("button", {
      key: it.key,
      type: "button",
      "aria-label": it.label,
      "aria-current": active ? 'page' : undefined,
      onClick: () => it.onClick ? it.onClick() : onSelect && onSelect(it.key),
      className: "sd-bottomnav__tab" + (active ? " sd-bottomnav__tab--active" : "")
    }, it.icon, it.label && /*#__PURE__*/React.createElement("span", null, it.label));
  };
  const renderFab = () => fab && /*#__PURE__*/React.createElement("button", {
    key: "__fab",
    type: "button",
    "aria-label": fab.label || 'Add',
    onClick: () => fab.onClick ? fab.onClick() : onSelect && onSelect(fab.key),
    className: "sd-bottomnav__fab"
  }, fab.icon);
  const mid = Math.ceil(tabs.length / 2);
  const children = primary ? [...tabs.slice(0, mid).map(renderTab), renderFab(), ...tabs.slice(mid).map(renderTab)] : items.map(it => it.fab ? renderFab() : renderTab(it));
  return /*#__PURE__*/React.createElement("nav", {
    className: "sd-bottomnav",
    "aria-label": "Primary",
    style: style
  }, children);
}
Object.assign(__ds_scope, { BottomNav });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/BottomNav.jsx", error: String((e && e.message) || e) }); }

// components/navigation/WeekDay.jsx
try { (() => {
const WEEKDAY_CATEGORY_COLORS = {
  push: {
    tint: 'var(--push-tint)',
    fg: 'var(--push-700)',
    dot: 'var(--push-500)'
  },
  pull: {
    tint: 'var(--pull-tint)',
    fg: 'var(--pull-700)',
    dot: 'var(--pull-500)'
  },
  leg: {
    tint: 'var(--leg-tint)',
    fg: 'var(--leg-700)',
    dot: 'var(--leg-500)'
  },
  other: {
    tint: 'var(--other-tint)',
    fg: 'var(--other-700)',
    dot: 'var(--other-500)'
  }
};

/**
 * WeekDay — a single day cell in the horizontal week strip.
 * Shows weekday + date number; days with a workout are tinted by their
 * category; the selected day gets a ring + lift. Combo labels (Upper/Full)
 * show a tiny caption.
 */
function WeekDay({
  weekday,
  day,
  category = null,
  selected = false,
  today = false,
  caption = null,
  onClick,
  style = {}
}) {
  const c = category ? WEEKDAY_CATEGORY_COLORS[category] || WEEKDAY_CATEGORY_COLORS.other : null;
  let bg = 'transparent';
  let fg = 'var(--text-secondary)';
  let border = '1px solid transparent';
  if (c) {
    bg = c.tint;
    fg = c.fg;
  }
  if (selected) {
    border = '1px solid var(--accent)';
  } else if (today) {
    border = '1px solid var(--border-strong)';
  }
  return /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onClick,
    className: "sd-focus-ring",
    style: {
      display: 'inline-flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 2,
      minWidth: 60,
      padding: '8px 6px',
      borderRadius: 'var(--radius-lg)',
      background: bg,
      color: fg,
      border,
      boxShadow: selected ? 'var(--shadow-md)' : 'none',
      transform: selected ? 'translateY(-1px)' : 'none',
      cursor: 'pointer',
      flexShrink: 0,
      transition: 'background var(--dur-fast) var(--ease-standard), transform var(--dur-fast) var(--ease-standard)',
      WebkitTapHighlightColor: 'transparent',
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--text-3xs)',
      fontWeight: 'var(--weight-bold)',
      textTransform: 'uppercase',
      letterSpacing: '0.04em',
      opacity: 0.85
    }
  }, weekday), /*#__PURE__*/React.createElement("span", {
    className: "sd-tnum",
    style: {
      fontSize: 'var(--text-lg)',
      fontWeight: 'var(--weight-bold)',
      lineHeight: 1.1
    }
  }, day), caption ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '0.5625rem',
      fontWeight: 'var(--weight-bold)',
      textTransform: 'uppercase',
      letterSpacing: '0.04em',
      opacity: 0.9
    }
  }, caption) : /*#__PURE__*/React.createElement("span", {
    style: {
      width: 5,
      height: 5,
      borderRadius: '50%',
      marginTop: 2,
      background: c ? c.dot : 'transparent'
    }
  }));
}
Object.assign(__ds_scope, { WeekDay });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/WeekDay.jsx", error: String((e && e.message) || e) }); }

// components/navigation/WeekStrip.jsx
try { (() => {
if (typeof document !== 'undefined' && !document.getElementById('sd-weekstrip-css')) {
  const s = document.createElement('style');
  s.id = 'sd-weekstrip-css';
  s.textContent = `
.sd-weekstrip { position: relative; display: flex; align-items: stretch; padding: 6px; background: var(--surface-card); border: 1px solid var(--border-subtle); border-radius: var(--radius-xl); box-shadow: var(--shadow-sm); touch-action: pan-y; }
.sd-weekstrip__pill { position: absolute; top: 6px; bottom: 6px; left: 6px; background: var(--accent); border-radius: var(--radius-lg); box-shadow: var(--shadow-accent); transition: transform var(--dur-base) var(--ease-spring), width var(--dur-base) var(--ease-spring); z-index: 0; }
.sd-weekstrip__day { position: relative; z-index: 1; flex: 1 1 0; min-width: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px; padding: 8px 0; border: none; background: transparent; cursor: pointer; border-radius: var(--radius-lg); transition: color var(--dur-fast) var(--ease-standard), transform var(--dur-fast) var(--ease-spring); color: var(--text-secondary); font-family: var(--font-sans); -webkit-tap-highlight-color: transparent; }
.sd-weekstrip__day:active { transform: scale(var(--press-scale)); }
.sd-weekstrip__day:focus-visible { outline: none; box-shadow: 0 0 0 3px var(--ring); }
.sd-weekstrip__dow { font-size: var(--text-xs); font-weight: var(--weight-medium); letter-spacing: var(--tracking-wide); text-transform: uppercase; opacity: 0.85; }
.sd-weekstrip__num { font-size: var(--text-lg); font-weight: var(--weight-bold); line-height: 1; font-variant-numeric: tabular-nums; }
.sd-weekstrip__day--today .sd-weekstrip__num { text-decoration: underline; text-underline-offset: 3px; text-decoration-thickness: 2px; }
.sd-weekstrip__day--selected { color: #fff; }
.sd-weekstrip__dot { width: 5px; height: 5px; border-radius: 50%; background: var(--sd-dot, transparent); transition: background var(--dur-fast) var(--ease-standard); }
.sd-weekstrip__day--selected .sd-weekstrip__dot { background: rgba(255,255,255,0.9); }
`;
  document.head.appendChild(s);
}
const DOT_BY_CATEGORY = {
  push: 'var(--push-500)',
  pull: 'var(--pull-500)',
  leg: 'var(--leg-500)',
  other: 'var(--other-500)'
};
function WeekStrip({
  days = [],
  selectedISO,
  onSelect = () => {},
  className = '',
  style = {}
}) {
  const isoOf = d => d.iso ?? d.dateISO;
  const n = days.length || 7;
  const idx = Math.max(0, days.findIndex(d => isoOf(d) === selectedISO));
  return /*#__PURE__*/React.createElement("div", {
    className: ['sd-weekstrip', className].filter(Boolean).join(' '),
    role: "tablist",
    "aria-label": "Week",
    style: style
  }, /*#__PURE__*/React.createElement("span", {
    className: "sd-weekstrip__pill",
    style: {
      width: `calc((100% - 12px) / ${n})`,
      transform: `translateX(${idx * 100}%)`
    },
    "aria-hidden": "true"
  }), days.map(d => {
    const iso = isoOf(d);
    const selected = iso === selectedISO;
    const isToday = d.today ?? d.isToday ?? false;
    const dot = d.category ? DOT_BY_CATEGORY[d.category] || DOT_BY_CATEGORY.other : null;
    return /*#__PURE__*/React.createElement("button", {
      key: iso,
      type: "button",
      role: "tab",
      "aria-selected": selected,
      onClick: () => onSelect(iso),
      className: ['sd-weekstrip__day', selected ? 'sd-weekstrip__day--selected' : '', isToday ? 'sd-weekstrip__day--today' : ''].filter(Boolean).join(' '),
      style: dot ? { '--sd-dot': dot } : undefined
    }, /*#__PURE__*/React.createElement("span", {
      className: "sd-weekstrip__dow"
    }, d.wd ?? d.dow ?? ''), /*#__PURE__*/React.createElement("span", {
      className: "sd-weekstrip__num"
    }, d.d ?? d.day), /*#__PURE__*/React.createElement("span", {
      className: "sd-weekstrip__dot"
    }));
  }));
}
Object.assign(__ds_scope, { WeekStrip });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/WeekStrip.jsx", error: String((e && e.message) || e) }); }

// ui_kits/strength-data/Chart.jsx
try { (() => {
/* AreaChart — lightweight SVG progress chart for the Strength Data UI kit.
   Smooth area + line, period-max reference line, x labels. Light theme. */
function AreaChart({
  data = [],
  labels = [],
  color = 'var(--blue-500)',
  height = 200
}) {
  const W = 320,
    H = height,
    padL = 8,
    padR = 14,
    padT = 16,
    padB = 24;
  const n = data.length;
  if (n === 0) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const span = max - min || 1;
  // y-domain padded a little below min for a livelier curve
  const lo = Math.max(0, min - span * 0.4);
  const hi = max + span * 0.15;
  const x = i => padL + i / (n - 1) * (W - padL - padR);
  const y = v => padT + (1 - (v - lo) / (hi - lo)) * (H - padT - padB);
  const pts = data.map((v, i) => [x(i), y(v)]);
  // smooth path (catmull-rom → bezier)
  const line = smooth(pts);
  const area = `${line} L ${pts[n - 1][0].toFixed(1)} ${(H - padB).toFixed(1)} L ${pts[0][0].toFixed(1)} ${(H - padB).toFixed(1)} Z`;
  const maxY = y(max);
  const uid = 'g' + Math.random().toString(36).slice(2, 8);

  // gridlines
  const grid = [0.5, 1].map(f => padT + f * (H - padT - padB));
  return /*#__PURE__*/React.createElement("svg", {
    viewBox: `0 0 ${W} ${H}`,
    width: "100%",
    height: H,
    style: {
      display: 'block'
    },
    preserveAspectRatio: "none"
  }, /*#__PURE__*/React.createElement("defs", null, /*#__PURE__*/React.createElement("linearGradient", {
    id: uid,
    x1: "0",
    y1: "0",
    x2: "0",
    y2: "1"
  }, /*#__PURE__*/React.createElement("stop", {
    offset: "0%",
    stopColor: color,
    stopOpacity: "0.22"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: "100%",
    stopColor: color,
    stopOpacity: "0"
  }))), grid.map((gy, i) => /*#__PURE__*/React.createElement("line", {
    key: i,
    x1: padL,
    y1: gy,
    x2: W - padR,
    y2: gy,
    stroke: "var(--gray-200)",
    strokeWidth: "1",
    strokeDasharray: "3 4"
  })), /*#__PURE__*/React.createElement("line", {
    x1: padL,
    y1: maxY,
    x2: W - padR,
    y2: maxY,
    stroke: color,
    strokeWidth: "1",
    strokeDasharray: "3 3",
    opacity: "0.5"
  }), /*#__PURE__*/React.createElement("path", {
    d: area,
    fill: `url(#${uid})`
  }), /*#__PURE__*/React.createElement("path", {
    d: line,
    fill: "none",
    stroke: color,
    strokeWidth: "2.5",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }), pts.map(([px, py], i) => /*#__PURE__*/React.createElement("circle", {
    key: i,
    cx: px,
    cy: py,
    r: i === n - 1 ? 4 : 0,
    fill: "#fff",
    stroke: color,
    strokeWidth: "2.5"
  })), labels.map((lb, i) => i % Math.ceil(n / 5) === 0 || i === n - 1 ? /*#__PURE__*/React.createElement("text", {
    key: i,
    x: x(i),
    y: H - 6,
    fontSize: "9",
    fontWeight: "600",
    fill: "var(--gray-400)",
    textAnchor: i === 0 ? 'start' : i === n - 1 ? 'end' : 'middle'
  }, lb) : null));
}
function smooth(pts) {
  if (pts.length < 2) return '';
  let d = `M ${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] || p2;
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  return d;
}
window.AreaChart = AreaChart;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/strength-data/Chart.jsx", error: String((e && e.message) || e) }); }

// ui_kits/strength-data/data.jsx
try { (() => {
/* Shared sample data, helpers, Icon + AreaChart for the Strength Data UI kit.
   Exposed on window for the screen files to consume. */

// ---- Lucide icon helper (icon-node → SVG string, stroke = currentColor) ----
function iconToSvg(node, size = 20, stroke = 2) {
  if (!node || !Array.isArray(node)) return '';
  const [, attrs, children] = node;
  const a = {
    ...attrs,
    width: size,
    height: size,
    'stroke-width': stroke
  };
  const at = Object.entries(a).map(([k, v]) => `${k}="${v}"`).join(' ');
  const kids = (children || []).map(([t, ca]) => `<${t} ${Object.entries(ca).map(([k, v]) => `${k}="${v}"`).join(' ')}/>`).join('');
  return `<svg ${at}>${kids}</svg>`;
}
function Icon({
  name,
  size = 20,
  stroke = 2,
  style = {}
}) {
  const node = window.lucide && window.lucide[name] || null;
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      ...style
    },
    dangerouslySetInnerHTML: {
      __html: iconToSvg(node, size, stroke)
    }
  });
}

// ---- Category / muscle metadata ----
const CATEGORY = {
  push: {
    label: 'Push',
    muscles: 'Chest, Shoulders, Triceps'
  },
  pull: {
    label: 'Pull',
    muscles: 'Back, Biceps'
  },
  leg: {
    label: 'Leg',
    muscles: 'Legs, Glutes'
  },
  other: {
    label: 'Other',
    muscles: 'Core & Support'
  }
};

// ---- Exercise library (subset of the real app's defaults) ----
const LIBRARY = [{
  name: 'Bench Press',
  category: 'push',
  muscles: ['Chest', 'Shoulders', 'Triceps'],
  records: 117,
  last: '14 Jun'
}, {
  name: 'Incline Dumbbell Press',
  category: 'push',
  muscles: ['Chest', 'Shoulders'],
  records: 86,
  last: '14 Jun'
}, {
  name: 'Overhead Press',
  category: 'push',
  muscles: ['Shoulders', 'Triceps'],
  records: 98,
  last: '10 Jun'
}, {
  name: 'Lateral Raise',
  category: 'push',
  muscles: ['Shoulders'],
  records: 83,
  last: '14 Jun'
}, {
  name: 'Triceps Pushdown',
  category: 'push',
  muscles: ['Triceps'],
  records: 43,
  last: '07 Jun'
}, {
  name: 'Chest Fly',
  category: 'push',
  muscles: ['Chest'],
  records: 90,
  last: '14 Jun'
}, {
  name: 'Lat Pulldown',
  category: 'pull',
  muscles: ['Back', 'Lats', 'Biceps'],
  records: 91,
  last: '12 Jun'
}, {
  name: 'Cable Row',
  category: 'pull',
  muscles: ['Back', 'Biceps'],
  records: 77,
  last: '12 Jun'
}, {
  name: 'Pull Up',
  category: 'pull',
  muscles: ['Back', 'Lats', 'Biceps'],
  records: 38,
  last: '12 Jun'
}, {
  name: 'Barbell Curl',
  category: 'pull',
  muscles: ['Biceps'],
  records: 46,
  last: '12 Jun'
}, {
  name: 'Squat',
  category: 'leg',
  muscles: ['Legs', 'Quads', 'Glutes'],
  records: 11,
  last: '09 Jun'
}, {
  name: 'Romanian Deadlift',
  category: 'leg',
  muscles: ['Hamstrings', 'Glutes'],
  records: 10,
  last: '09 Jun'
}, {
  name: 'Leg Press',
  category: 'leg',
  muscles: ['Legs', 'Glutes'],
  records: 8,
  last: '09 Jun'
}, {
  name: 'Hip Thrust',
  category: 'leg',
  muscles: ['Glutes', 'Hamstrings'],
  records: 9,
  last: '09 Jun'
}, {
  name: 'Plank',
  category: 'other',
  muscles: ['Core'],
  records: 4,
  last: '05 Jun'
}];

// ---- Week strip days (around Mon 15 Jun 2026) ----
const WEEK = [{
  iso: '2026-06-08',
  wd: 'Mon',
  d: 8,
  category: 'push'
}, {
  iso: '2026-06-09',
  wd: 'Tue',
  d: 9,
  category: 'leg',
  caption: 'Leg'
}, {
  iso: '2026-06-10',
  wd: 'Wed',
  d: 10,
  category: 'push'
}, {
  iso: '2026-06-11',
  wd: 'Thu',
  d: 11,
  category: null
}, {
  iso: '2026-06-12',
  wd: 'Fri',
  d: 12,
  category: 'pull'
}, {
  iso: '2026-06-13',
  wd: 'Sat',
  d: 13,
  category: null
}, {
  iso: '2026-06-14',
  wd: 'Sun',
  d: 14,
  category: 'push'
}, {
  iso: '2026-06-15',
  wd: 'Mon',
  d: 15,
  category: 'push'
}];

// ---- Today's workout ----
const TODAY_WORKOUT = {
  date: '2026-06-15',
  weekday: 'Monday',
  dateLabel: 'June 15',
  category: 'push',
  bodyWeight: 78.5,
  fuel: 'Oats, banana & whey — 40 min before.',
  notes: 'Felt strong on press. Push for 102.5kg next week.',
  items: [{
    name: 'Bench Press',
    sets: [{
      r: 12,
      w: 80
    }, {
      r: 10,
      w: 90
    }, {
      r: 6,
      w: 100,
      pr: 'new'
    }]
  }, {
    name: 'Overhead Press',
    sets: [{
      r: 12,
      w: 45
    }, {
      r: 10,
      w: 50
    }, {
      r: 8,
      w: 55
    }]
  }, {
    name: 'Incline Dumbbell Press',
    sets: [{
      r: 12,
      w: 24
    }, {
      r: 12,
      w: 26
    }, {
      r: 10,
      w: 28
    }]
  }, {
    name: 'Lateral Raise',
    sets: [{
      r: 15,
      w: 12
    }, {
      r: 15,
      w: 12
    }, {
      r: 12,
      w: 14
    }]
  }, {
    name: 'Triceps Pushdown',
    sets: [{
      r: 15,
      w: 60
    }, {
      r: 12,
      w: 66
    }]
  }]
};

// ---- Exercise detail: Bench Press progress ----
const BENCH_DETAIL = {
  name: 'Bench Press',
  muscles: 'Chest, Shoulders, Triceps',
  best: {
    value: 100,
    date: '15 Jun 2026'
  },
  trend: 4,
  // chronological sessions (oldest → newest)
  chart: {
    weight: [80, 82.5, 85, 85, 90, 90, 95, 95, 100],
    oneRm: [101, 104, 107, 106, 112, 114, 119, 118, 124],
    volume: [3200, 3380, 3500, 3460, 3900, 3950, 4180, 4120, 4320],
    labels: ['4/4', '11/4', '18/4', '2/5', '16/5', '23/5', '4/6', '10/6', '15/6']
  },
  history: [{
    date: 'Mon 15 Jun',
    volume: 4320,
    sets: [{
      w: 80,
      r: 12
    }, {
      w: 90,
      r: 10
    }, {
      w: 100,
      r: 6,
      pr: 'new'
    }]
  }, {
    date: 'Wed 10 Jun',
    volume: 4180,
    sets: [{
      w: 80,
      r: 12
    }, {
      w: 90,
      r: 9
    }, {
      w: 95,
      r: 6
    }]
  }, {
    date: 'Wed 04 Jun',
    volume: 3950,
    sets: [{
      w: 75,
      r: 12
    }, {
      w: 85,
      r: 10
    }, {
      w: 95,
      r: 5
    }]
  }, {
    date: 'Fri 23 May',
    volume: 3900,
    sets: [{
      w: 75,
      r: 12
    }, {
      w: 85,
      r: 10
    }, {
      w: 90,
      r: 6
    }]
  }, {
    date: 'Fri 16 May',
    volume: 3460,
    sets: [{
      w: 70,
      r: 12
    }, {
      w: 80,
      r: 10
    }, {
      w: 90,
      r: 4,
      pr: 'tied'
    }]
  }]
};
const USER = {
  name: 'Ahmet Yılmaz',
  email: 'ahmet@example.com'
};
Object.assign(window, {
  Icon,
  CATEGORY,
  LIBRARY,
  WEEK,
  TODAY_WORKOUT,
  BENCH_DETAIL,
  USER
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/strength-data/data.jsx", error: String((e && e.message) || e) }); }

// ui_kits/strength-data/screens-auth-today.jsx
try { (() => {
/* Login + Today screens for the Strength Data UI kit. */
const DS = window.StrengthDataDesignSystem_5c629b;

// ============================ LOGIN ============================
function LoginScreen({
  nav
}) {
  const {
    Button,
    Input,
    IconButton
  } = DS;
  const [isLogin, setIsLogin] = React.useState(true);
  const [show, setShow] = React.useState(false);
  const [email, setEmail] = React.useState('ahmet@example.com');
  const [pw, setPw] = React.useState('strongpass');
  const [name, setName] = React.useState('');
  return /*#__PURE__*/React.createElement("div", {
    style: {
      minHeight: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      padding: '24px 20px',
      background: 'var(--surface-page)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "sd-slide-in",
    style: {
      width: '100%'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      marginBottom: 26
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/mark-app.svg",
    width: "60",
    height: "60",
    style: {
      borderRadius: 18,
      boxShadow: 'var(--shadow-md)'
    },
    alt: "Strength Data"
  }), /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: '16px 0 6px',
      fontSize: 'var(--text-2xl)',
      fontWeight: 800,
      letterSpacing: '-.02em',
      color: 'var(--text-primary)'
    }
  }, isLogin ? 'Welcome back' : 'Create your account'), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: 'var(--text-sm)',
      color: 'var(--text-secondary)',
      fontWeight: 500
    }
  }, isLogin ? 'Pick up your training right where you left off' : 'Start tracking your progress today')), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }
  }, !isLogin && /*#__PURE__*/React.createElement(Input, {
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: "User",
      size: 18
    }),
    placeholder: "Full name",
    value: name,
    onChange: e => setName(e.target.value)
  }), /*#__PURE__*/React.createElement(Input, {
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: "Mail",
      size: 18
    }),
    placeholder: "Email address",
    value: email,
    onChange: e => setEmail(e.target.value)
  }), /*#__PURE__*/React.createElement(Input, {
    type: show ? 'text' : 'password',
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: "Lock",
      size: 18
    }),
    placeholder: "Password",
    value: pw,
    onChange: e => setPw(e.target.value),
    trailing: /*#__PURE__*/React.createElement(IconButton, {
      ariaLabel: "Toggle password",
      variant: "ghost",
      size: "sm",
      onClick: () => setShow(s => !s)
    }, /*#__PURE__*/React.createElement(Icon, {
      name: show ? 'EyeOff' : 'Eye',
      size: 18
    }))
  }), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    fullWidth: true,
    size: "lg",
    trailingIcon: /*#__PURE__*/React.createElement(Icon, {
      name: "ArrowRight",
      size: 16
    }),
    onClick: () => nav.go('today'),
    style: {
      marginTop: 4
    }
  }, isLogin ? 'Sign in' : 'Create account')), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      margin: '20px 0'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      height: 1,
      background: 'var(--border-subtle)'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--text-xs)',
      color: 'var(--text-tertiary)',
      fontWeight: 600
    }
  }, "or"), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      height: 1,
      background: 'var(--border-subtle)'
    }
  })), /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    fullWidth: true,
    size: "lg",
    onClick: () => nav.go('today'),
    icon: /*#__PURE__*/React.createElement("img", {
      src: "https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg",
      width: "18",
      height: "18",
      alt: ""
    })
  }, "Continue with Google"), /*#__PURE__*/React.createElement("p", {
    style: {
      textAlign: 'center',
      marginTop: 22,
      fontSize: 'var(--text-sm)',
      color: 'var(--text-secondary)',
      fontWeight: 500
    }
  }, isLogin ? "Don't have an account? " : 'Already have an account? ', /*#__PURE__*/React.createElement("button", {
    onClick: () => setIsLogin(v => !v),
    style: {
      border: 'none',
      background: 'none',
      padding: 0,
      cursor: 'pointer',
      color: 'var(--text-link)',
      fontWeight: 700,
      fontFamily: 'var(--font-sans)',
      fontSize: 'inherit'
    }
  }, isLogin ? 'Sign up' : 'Sign in'))));
}

// ============================ TODAY ============================
function TodayScreen({
  nav
}) {
  const {
    Card,
    CategoryBadge,
    Badge,
    SetChip,
    IconButton,
    Avatar,
    BottomNav,
    WeekStrip
  } = DS;
  const w = TODAY_WORKOUT;
  const [selected, setSelected] = React.useState('2026-06-15');
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [picker, setPicker] = React.useState(false);
  const [edit, setEdit] = React.useState(null); // exercise being quick-edited

  return /*#__PURE__*/React.createElement("div", {
    style: {
      height: '100%',
      background: 'var(--surface-page)',
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "sd-no-scrollbar",
    style: {
      flex: 1,
      overflowY: 'auto'
    }
  }, /*#__PURE__*/React.createElement("header", {
    style: {
      position: 'sticky',
      top: 0,
      zIndex: 20,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '14px 16px',
      background: 'rgba(247,248,250,0.9)',
      backdropFilter: 'saturate(180%) blur(8px)',
      borderBottom: '1px solid var(--border-subtle)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/mark-app.svg",
    width: "38",
    height: "38",
    style: {
      borderRadius: 11
    },
    alt: "Strength Data"
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--text-lg)',
      fontWeight: 800,
      letterSpacing: '-.02em',
      color: 'var(--text-primary)',
      lineHeight: 1.05
    }
  }, w.dateLabel), /*#__PURE__*/React.createElement("div", {
    className: "sd-eyebrow",
    style: {
      marginTop: 2
    }
  }, w.weekday, " \xB7 2026"))), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setMenuOpen(o => !o),
    style: {
      border: 'none',
      background: 'none',
      padding: 0,
      cursor: 'pointer',
      borderRadius: '50%'
    },
    "aria-label": "Profile menu"
  }, /*#__PURE__*/React.createElement(Avatar, {
    name: USER.name,
    size: 40
  })), menuOpen && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    onClick: () => setMenuOpen(false),
    style: {
      position: 'fixed',
      inset: 0,
      zIndex: 30
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "sd-slide-in",
    style: {
      position: 'absolute',
      right: 0,
      top: 48,
      zIndex: 31,
      width: 200,
      background: 'var(--surface-card)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow-lg)',
      padding: 6
    }
  }, [['CalendarDays', 'Calendar'], ['MessageSquare', 'Feedback'], ['User', 'Profile']].map(([ic, lb]) => /*#__PURE__*/React.createElement("button", {
    key: lb,
    onClick: () => {
      setMenuOpen(false);
      if (lb === 'Profile') nav.go('profile');
    },
    style: menuItemStyle
  }, /*#__PURE__*/React.createElement(Icon, {
    name: ic,
    size: 18,
    style: {
      color: 'var(--text-secondary)'
    }
  }), lb)))))), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'sticky',
      top: 67,
      zIndex: 10,
      background: 'rgba(247,248,250,0.9)',
      backdropFilter: 'blur(8px)',
      borderBottom: '1px solid var(--border-subtle)',
      padding: '10px 16px'
    }
  }, /*#__PURE__*/React.createElement(WeekStrip, {
    days: WEEK,
    selectedISO: selected,
    onSelect: setSelected
  })), /*#__PURE__*/React.createElement("main", {
    style: {
      padding: '16px 16px 110px'
    }
  }, /*#__PURE__*/React.createElement(Card, {
    pad: "md",
    className: "sd-slide-in",
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8,
      paddingBottom: 12,
      borderBottom: '1px solid var(--border-subtle)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(CategoryBadge, {
    category: w.category,
    onClick: () => {}
  }), /*#__PURE__*/React.createElement(BodyWeightBadge, {
    value: w.bodyWeight
  })), /*#__PURE__*/React.createElement(IconButton, {
    ariaLabel: "Edit workout",
    variant: "soft",
    size: "sm",
    onClick: () => nav.go('workout')
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "Pencil",
    size: 16
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    }
  }, w.items.map((ex, i) => /*#__PURE__*/React.createElement("button", {
    key: i,
    onClick: () => setEdit(ex),
    style: rowBtnStyle
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0,
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--text-sm)',
      fontWeight: 700,
      color: 'var(--text-primary)'
    }
  }, ex.name), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 6
    }
  }, ex.sets.map((s, j) => /*#__PURE__*/React.createElement(SetChip, {
    key: j,
    reps: s.r,
    weight: s.w,
    pr: s.pr || 'none',
    trophy: s.pr ? /*#__PURE__*/React.createElement(Icon, {
      name: "Trophy",
      size: 11
    }) : null
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      color: 'var(--text-tertiary)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "sd-eyebrow"
  }, ex.sets.length, " sets"), /*#__PURE__*/React.createElement(Icon, {
    name: "ChevronRight",
    size: 18
  }))))), /*#__PURE__*/React.createElement(Card, {
    tint: "accent",
    pad: "sm",
    style: {
      display: 'flex',
      gap: 8,
      alignItems: 'flex-start'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "Zap",
    size: 16,
    style: {
      color: 'var(--accent-hover)',
      marginTop: 1
    }
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--text-2xs)',
      fontWeight: 700,
      color: 'var(--accent-hover)',
      textTransform: 'uppercase',
      letterSpacing: '.04em'
    }
  }, "Fuel"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--text-xs)',
      color: 'var(--gray-700)',
      marginTop: 2
    }
  }, w.fuel))), /*#__PURE__*/React.createElement(Card, {
    tint: "sunken",
    pad: "sm"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--text-xs)',
      color: 'var(--gray-600)'
    }
  }, w.notes))))), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 16,
      right: 16,
      bottom: 16,
      zIndex: 15
    }
  }, /*#__PURE__*/React.createElement(BottomNav, {
    activeKey: "today",
    onSelect: k => {
      if (k === 'exercises') nav.go('exercises');
    },
    items: [{
      key: 'today',
      label: 'Today',
      icon: /*#__PURE__*/React.createElement(Icon, {
        name: "CalendarDays",
        size: 20
      })
    }, {
      key: 'exercises',
      label: 'Exercises',
      icon: /*#__PURE__*/React.createElement(Icon, {
        name: "ListChecks",
        size: 20
      })
    }],
    primary: {
      label: 'Add Exercise',
      icon: /*#__PURE__*/React.createElement(Icon, {
        name: "Plus",
        size: 22
      }),
      onClick: () => setPicker(true)
    }
  })), picker && /*#__PURE__*/React.createElement(ExercisePicker, {
    onClose: () => setPicker(false)
  }), edit && /*#__PURE__*/React.createElement(QuickEdit, {
    exercise: edit,
    nav: nav,
    onClose: () => setEdit(null)
  }));
}
function BodyWeightBadge({
  value
}) {
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      height: 24,
      padding: '0 10px',
      borderRadius: 'var(--radius-full)',
      background: 'var(--surface-sunken)',
      border: '1px solid var(--border-subtle)',
      fontSize: 'var(--text-2xs)',
      fontWeight: 700,
      color: 'var(--text-secondary)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "Scale",
    size: 13,
    style: {
      color: 'var(--accent)'
    }
  }), /*#__PURE__*/React.createElement("span", {
    className: "sd-tnum"
  }, value, " kg"));
}

// ---- Exercise picker modal ----
function ExercisePicker({
  onClose
}) {
  const {
    Input,
    CategoryBadge
  } = DS;
  const [q, setQ] = React.useState('');
  const list = LIBRARY.filter(e => !q || e.name.toLowerCase().includes(q.toLowerCase()) || e.muscles.join(' ').toLowerCase().includes(q.toLowerCase()));
  return /*#__PURE__*/React.createElement(Sheet, {
    onClose: onClose,
    title: "Add Exercise",
    subtitle: "Pick from your library or add a new one"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 16px 12px'
    }
  }, /*#__PURE__*/React.createElement(Input, {
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: "Search",
      size: 18
    }),
    placeholder: "Search exercises\u2026",
    value: q,
    onChange: e => setQ(e.target.value)
  })), /*#__PURE__*/React.createElement("div", {
    className: "sd-no-scrollbar",
    style: {
      overflowY: 'auto',
      flex: 1,
      padding: '0 8px 8px'
    }
  }, list.map(e => /*#__PURE__*/React.createElement("button", {
    key: e.name,
    onClick: onClose,
    style: pickRowStyle
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 4,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--text-sm)',
      fontWeight: 700,
      color: 'var(--text-primary)'
    }
  }, e.name), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--text-2xs)',
      color: 'var(--text-tertiary)'
    }
  }, e.muscles.join(', '))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(CategoryBadge, {
    category: e.category,
    size: "sm"
  }), /*#__PURE__*/React.createElement(Icon, {
    name: "Plus",
    size: 18,
    style: {
      color: 'var(--accent)'
    }
  })))), /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    style: {
      ...pickRowStyle,
      justifyContent: 'center',
      gap: 6,
      color: 'var(--text-link)',
      fontWeight: 700
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "Plus",
    size: 16
  }), "New / manual exercise")));
}

// ---- Quick edit modal ----
function QuickEdit({
  exercise,
  nav,
  onClose
}) {
  const {
    Stepper,
    Button,
    IconButton
  } = DS;
  const [sets, setSets] = React.useState(exercise.sets.map(s => ({
    ...s
  })));
  const upd = (i, k, dv) => setSets(p => p.map((s, j) => j === i ? {
    ...s,
    [k]: Math.max(0, (Number(s[k]) || 0) + dv)
  } : s));
  return /*#__PURE__*/React.createElement(Sheet, {
    onClose: onClose,
    eyebrow: "Edit",
    title: exercise.name,
    headerRight: /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      size: "sm",
      icon: /*#__PURE__*/React.createElement(Icon, {
        name: "ExternalLink",
        size: 14
      }),
      onClick: () => {
        onClose();
        nav.go('detail');
      }
    }, "Detail")
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      padding: '0 16px 4px'
    }
  }, sets.map((s, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: 'flex',
      alignItems: 'flex-end',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 16,
      textAlign: 'center',
      fontSize: 'var(--text-xs)',
      fontWeight: 700,
      color: 'var(--text-tertiary)',
      paddingBottom: 11
    }
  }, i + 1), /*#__PURE__*/React.createElement(Stepper, {
    label: "kg",
    value: s.w,
    onDecrement: () => upd(i, 'w', -2.5),
    onIncrement: () => upd(i, 'w', 2.5)
  }), /*#__PURE__*/React.createElement(Stepper, {
    label: "Reps",
    value: s.r,
    onDecrement: () => upd(i, 'r', -1),
    onIncrement: () => upd(i, 'r', 1)
  }), /*#__PURE__*/React.createElement(IconButton, {
    ariaLabel: "Delete set",
    variant: "ghost",
    onClick: () => setSets(p => p.filter((_, j) => j !== i)),
    style: {
      color: 'var(--red-500)',
      marginBottom: 1
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "Trash2",
    size: 18
  }))))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      padding: '14px 16px 4px'
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    onClick: () => setSets(p => [...p, {
      w: p.length ? p[p.length - 1].w : 20,
      r: p.length ? p[p.length - 1].r : 10
    }]),
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: "Plus",
      size: 16
    }),
    fullWidth: true
  }, "Add set")), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '8px 16px 4px'
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    fullWidth: true,
    size: "lg",
    onClick: onClose
  }, "Save & close")));
}

// ---- shared bottom sheet ----
function Sheet({
  children,
  onClose,
  title,
  subtitle,
  eyebrow,
  headerRight
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      zIndex: 40,
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    onClick: onClose,
    style: {
      position: 'absolute',
      inset: 0,
      background: 'rgba(31,41,55,0.32)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "sd-slide-in",
    style: {
      position: 'relative',
      width: '100%',
      maxHeight: '82%',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--surface-card)',
      borderTopLeftRadius: 'var(--radius-2xl)',
      borderTopRightRadius: 'var(--radius-2xl)',
      boxShadow: 'var(--shadow-xl)',
      paddingBottom: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'center',
      paddingTop: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 38,
      height: 4,
      borderRadius: 2,
      background: 'var(--gray-200)'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 10,
      padding: '12px 16px 14px'
    }
  }, /*#__PURE__*/React.createElement("div", null, eyebrow && /*#__PURE__*/React.createElement("div", {
    className: "sd-eyebrow",
    style: {
      color: 'var(--accent)',
      marginBottom: 3
    }
  }, eyebrow), /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: 0,
      fontSize: 'var(--text-xl)',
      fontWeight: 800,
      letterSpacing: '-.01em',
      color: 'var(--text-primary)'
    }
  }, title), subtitle && /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '3px 0 0',
      fontSize: 'var(--text-xs)',
      color: 'var(--text-secondary)'
    }
  }, subtitle)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8
    }
  }, headerRight, /*#__PURE__*/React.createElement(DS.IconButton, {
    ariaLabel: "Close",
    variant: "soft",
    onClick: onClose
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "X",
    size: 18
  })))), children));
}
const menuItemStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  width: '100%',
  padding: '10px 12px',
  border: 'none',
  background: 'none',
  borderRadius: 'var(--radius-sm)',
  cursor: 'pointer',
  fontFamily: 'var(--font-sans)',
  fontSize: 'var(--text-sm)',
  fontWeight: 600,
  color: 'var(--text-primary)',
  textAlign: 'left'
};
const rowBtnStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  width: '100%',
  padding: '12px',
  border: '1px solid var(--border-subtle)',
  background: 'var(--surface-card)',
  borderRadius: 'var(--radius-lg)',
  cursor: 'pointer',
  textAlign: 'left',
  WebkitTapHighlightColor: 'transparent'
};
const pickRowStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 10,
  width: '100%',
  padding: '12px',
  border: 'none',
  background: 'none',
  borderRadius: 'var(--radius-lg)',
  cursor: 'pointer',
  textAlign: 'left'
};
Object.assign(window, {
  LoginScreen,
  TodayScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/strength-data/screens-auth-today.jsx", error: String((e && e.message) || e) }); }

// ui_kits/strength-data/screens-detail-profile.jsx
try { (() => {
/* Exercise Detail + Profile screens for the Strength Data UI kit. */
const DS3 = window.StrengthDataDesignSystem_5c629b;

// ===================== EXERCISE DETAIL =====================
function ExerciseDetailScreen({
  nav
}) {
  const {
    Card,
    StatCard,
    SegmentedControl,
    IconButton,
    SetChip,
    Badge
  } = DS3;
  const d = BENCH_DETAIL;
  const [metric, setMetric] = React.useState('oneRm');
  const [range, setRange] = React.useState('1m');
  const metricMap = {
    weight: {
      key: 'weight',
      color: 'var(--blue-500)',
      label: 'Weight',
      unit: 'kg'
    },
    oneRm: {
      key: 'oneRm',
      color: 'var(--leg-500)',
      label: '1RM',
      unit: 'kg'
    },
    volume: {
      key: 'volume',
      color: 'var(--gray-700)',
      label: 'Volume',
      unit: 'kg'
    }
  };
  const m = metricMap[metric];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      height: '100%',
      background: 'var(--surface-page)',
      overflowY: 'auto'
    }
  }, /*#__PURE__*/React.createElement("header", {
    style: {
      position: 'sticky',
      top: 0,
      zIndex: 20,
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      padding: '10px 12px',
      background: 'rgba(247,248,250,0.92)',
      backdropFilter: 'blur(8px)',
      borderBottom: '1px solid var(--border-subtle)'
    }
  }, /*#__PURE__*/React.createElement(IconButton, {
    ariaLabel: "Back",
    variant: "ghost",
    onClick: () => nav.go('today')
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "ArrowLeft",
    size: 20
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--text-base)',
      fontWeight: 700,
      color: 'var(--text-primary)'
    }
  }, d.name), /*#__PURE__*/React.createElement("div", {
    className: "sd-eyebrow",
    style: {
      marginTop: 1
    }
  }, d.muscles)), /*#__PURE__*/React.createElement(IconButton, {
    ariaLabel: "Edit exercise",
    variant: "ghost"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "Pencil",
    size: 18
  }))), /*#__PURE__*/React.createElement("main", {
    style: {
      padding: '16px 16px 32px',
      display: 'flex',
      flexDirection: 'column',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(StatCard, {
    tone: "gold",
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: "Trophy",
      size: 16
    }),
    label: "Best",
    value: `${d.best.value} kg`,
    sub: d.best.date
  }), /*#__PURE__*/React.createElement(StatCard, {
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: "TrendingUp",
      size: 16
    }),
    label: "Strength change",
    value: `+${d.trend}%`,
    sub: "vs last 3 sessions",
    trend: "up"
  })), /*#__PURE__*/React.createElement(Card, {
    pad: "md",
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--text-sm)',
      fontWeight: 700,
      color: 'var(--text-primary)'
    }
  }, "Progress"), /*#__PURE__*/React.createElement(SegmentedControl, {
    size: "sm",
    fill: false,
    accent: m.color,
    options: [{
      value: 'weight',
      label: 'Weight'
    }, {
      value: 'oneRm',
      label: '1RM'
    }, {
      value: 'volume',
      label: 'Volume'
    }],
    value: metric,
    onChange: setMetric
  })), /*#__PURE__*/React.createElement(AreaChart, {
    data: d.chart[m.key],
    labels: d.chart.labels,
    color: m.color,
    height: 190
  }), /*#__PURE__*/React.createElement(SegmentedControl, {
    size: "sm",
    options: [{
      value: '1w',
      label: '1W'
    }, {
      value: '1m',
      label: '1M'
    }, {
      value: '1y',
      label: '1Y'
    }, {
      value: 'all',
      label: 'All'
    }],
    value: range,
    onChange: setRange
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "sd-eyebrow",
    style: {
      marginBottom: 10,
      paddingLeft: 2
    }
  }, "History"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column'
    }
  }, d.history.map((h, i) => {
    const maxW = Math.max(...h.sets.map(s => s.w));
    return /*#__PURE__*/React.createElement("button", {
      key: i,
      onClick: () => nav.go('today'),
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        padding: '12px 8px',
        border: 'none',
        borderBottom: '1px solid var(--border-subtle)',
        background: 'none',
        cursor: 'pointer',
        textAlign: 'left'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 10
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 'var(--text-xs)',
        fontWeight: 700,
        color: 'var(--text-secondary)'
      }
    }, h.date), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        height: 1,
        background: 'var(--border-subtle)'
      }
    }), /*#__PURE__*/React.createElement("span", {
      className: "sd-tnum",
      style: {
        fontSize: 'var(--text-2xs)',
        color: 'var(--text-tertiary)'
      }
    }, "Vol ", h.volume.toLocaleString(), " kg")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: 6
      }
    }, h.sets.map((s, j) => /*#__PURE__*/React.createElement(SetChip, {
      key: j,
      reps: s.r,
      weight: s.w,
      pr: s.w === maxW ? s.pr || 'none' : 'none',
      trophy: s.pr ? /*#__PURE__*/React.createElement(Icon, {
        name: "Trophy",
        size: 11
      }) : null
    }))));
  })))));
}

// ========================= PROFILE =========================
function ProfileScreen({
  nav
}) {
  const {
    Card,
    Avatar,
    Button,
    Badge
  } = DS3;
  const [pwOpen, setPwOpen] = React.useState(false);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      height: '100%',
      background: 'var(--surface-page)',
      overflowY: 'auto'
    }
  }, /*#__PURE__*/React.createElement(window.TopBar, {
    title: "Profile",
    onBack: () => nav.go('today')
  }), /*#__PURE__*/React.createElement("main", {
    style: {
      padding: '16px 16px 40px',
      display: 'flex',
      flexDirection: 'column',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(Card, {
    pad: "lg",
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    name: USER.name,
    size: 56
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--text-lg)',
      fontWeight: 800,
      color: 'var(--text-primary)',
      letterSpacing: '-.01em'
    }
  }, USER.name), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--text-xs)',
      color: 'var(--text-secondary)'
    }
  }, USER.email), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 5,
      marginTop: 6
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "ShieldCheck",
    size: 13,
    style: {
      color: 'var(--green-500)'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--text-2xs)',
      color: 'var(--text-tertiary)'
    }
  }, "Your data is backed up in the cloud")))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 1,
      borderRadius: 'var(--radius-2xl)',
      overflow: 'hidden',
      border: '1px solid var(--border-subtle)',
      boxShadow: 'var(--shadow-sm)'
    }
  }, /*#__PURE__*/React.createElement(SettingRow, {
    icon: "Sparkles",
    label: "Year in Review",
    sub: "Your 2026 training, wrapped",
    accent: true
  }), /*#__PURE__*/React.createElement(SettingRow, {
    icon: "Lock",
    label: "Security & Password",
    sub: "Change your password",
    onClick: () => setPwOpen(o => !o),
    chevronOpen: pwOpen
  }), pwOpen && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 16px 16px',
      background: 'var(--surface-card)',
      display: 'flex',
      flexDirection: 'column',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(DS3.Input, {
    type: "password",
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: "Lock",
      size: 18
    }),
    placeholder: "New password (min 6 chars)"
  }), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    size: "md",
    style: {
      alignSelf: 'flex-start'
    }
  }, "Update password")), /*#__PURE__*/React.createElement(SettingRow, {
    icon: "Download",
    label: "Export data",
    sub: "Download all data as JSON"
  }), /*#__PURE__*/React.createElement(SettingRow, {
    icon: "Upload",
    label: "Import data",
    sub: "Restore from a backup file"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    fullWidth: true,
    size: "lg",
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: "LogOut",
      size: 18
    }),
    onClick: () => nav.go('login')
  }, "Log out"), /*#__PURE__*/React.createElement(Button, {
    variant: "danger",
    fullWidth: true,
    size: "lg",
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: "Trash2",
      size: 18
    })
  }, "Delete account"))));
}
function SettingRow({
  icon,
  label,
  sub,
  accent,
  onClick,
  chevronOpen
}) {
  return /*#__PURE__*/React.createElement("button", {
    onClick: onClick,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      width: '100%',
      padding: '14px 16px',
      border: 'none',
      background: 'var(--surface-card)',
      cursor: 'pointer',
      textAlign: 'left'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 38,
      height: 38,
      borderRadius: 'var(--radius-md)',
      background: accent ? 'var(--accent-tint)' : 'var(--surface-sunken)',
      color: accent ? 'var(--accent-hover)' : 'var(--text-secondary)',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: icon,
    size: 18
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--text-sm)',
      fontWeight: 700,
      color: 'var(--text-primary)'
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--text-2xs)',
      color: 'var(--text-tertiary)'
    }
  }, sub)), /*#__PURE__*/React.createElement(Icon, {
    name: chevronOpen ? 'ChevronUp' : 'ChevronRight',
    size: 18,
    style: {
      color: 'var(--text-tertiary)'
    }
  }));
}
Object.assign(window, {
  ExerciseDetailScreen,
  ProfileScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/strength-data/screens-detail-profile.jsx", error: String((e && e.message) || e) }); }

// ui_kits/strength-data/screens-workout-exercises.jsx
try { (() => {
/* Workout Detail + Exercises screens for the Strength Data UI kit. */
const DS2 = window.StrengthDataDesignSystem_5c629b;

// ====================== WORKOUT DETAIL ======================
function WorkoutDetailScreen({
  nav
}) {
  const {
    Card,
    Button,
    IconButton,
    Stepper,
    Input
  } = DS2;
  const w = TODAY_WORKOUT;
  const [focus, setFocus] = React.useState(['push']);
  const [items, setItems] = React.useState(w.items.slice(0, 3).map(x => ({
    ...x,
    sets: x.sets.map(s => ({
      ...s
    }))
  })));
  const toggleFocus = k => setFocus(p => p.includes(k) ? p.filter(x => x !== k) : [...p, k]);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      height: '100%',
      background: 'var(--surface-page)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement(TopBar, {
    title: "Workout Detail",
    onBack: () => nav.go('today'),
    right: /*#__PURE__*/React.createElement(IconButton, {
      ariaLabel: "Delete workout",
      variant: "ghost",
      style: {
        color: 'var(--red-500)'
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "Trash2",
      size: 18
    }))
  }), /*#__PURE__*/React.createElement("main", {
    style: {
      flex: 1,
      padding: '16px 16px 96px',
      display: 'flex',
      flexDirection: 'column',
      gap: 14,
      overflowY: 'auto'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: 0,
      fontSize: 'var(--text-3xl)',
      fontWeight: 800,
      letterSpacing: '-.02em',
      color: 'var(--text-primary)'
    }
  }, w.dateLabel), /*#__PURE__*/React.createElement("div", {
    className: "sd-eyebrow",
    style: {
      marginTop: 2
    }
  }, w.weekday, " \xB7 2026")), /*#__PURE__*/React.createElement(IconButton, {
    ariaLabel: "Move workout",
    variant: "outline"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "CalendarDays",
    size: 18
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8
    }
  }, [['push', 'Push'], ['pull', 'Pull'], ['leg', 'Leg']].map(([k, lb]) => {
    const on = focus.includes(k);
    const colors = {
      push: ['var(--push-tint)', 'var(--push-700)', 'var(--push-500)'],
      pull: ['var(--pull-tint)', 'var(--pull-700)', 'var(--pull-500)'],
      leg: ['var(--leg-tint)', 'var(--leg-700)', 'var(--leg-500)']
    }[k];
    return /*#__PURE__*/React.createElement("button", {
      key: k,
      onClick: () => toggleFocus(k),
      style: {
        flex: 1,
        height: 44,
        borderRadius: 'var(--radius-md)',
        border: `1px solid ${on ? colors[2] : 'var(--border-subtle)'}`,
        background: on ? colors[0] : 'var(--surface-card)',
        color: on ? colors[1] : 'var(--text-secondary)',
        fontFamily: 'var(--font-sans)',
        fontSize: 'var(--text-sm)',
        fontWeight: 700,
        cursor: 'pointer'
      }
    }, lb);
  })), /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: "History",
      size: 16
    }),
    style: {
      alignSelf: 'flex-start',
      color: 'var(--text-link)'
    }
  }, "Load from history"), items.map((ex, i) => /*#__PURE__*/React.createElement(Card, {
    key: i,
    pad: "md",
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => nav.go('detail'),
    style: {
      border: 'none',
      background: 'none',
      padding: 0,
      cursor: 'pointer',
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--text-base)',
      fontWeight: 700,
      color: 'var(--text-primary)'
    }
  }, ex.name), /*#__PURE__*/React.createElement(IconButton, {
    ariaLabel: "Edit exercise",
    variant: "soft",
    size: "sm"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "SlidersHorizontal",
    size: 16
  }))), ex.sets.map((s, j) => /*#__PURE__*/React.createElement("div", {
    key: j,
    style: {
      display: 'flex',
      alignItems: 'flex-end',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 14,
      textAlign: 'center',
      fontSize: 'var(--text-xs)',
      fontWeight: 700,
      color: 'var(--text-tertiary)',
      paddingBottom: 11
    }
  }, j + 1), /*#__PURE__*/React.createElement(Stepper, {
    label: "kg",
    value: s.w,
    onDecrement: () => setItems(adj(i, j, 'w', -2.5)),
    onIncrement: () => setItems(adj(i, j, 'w', 2.5))
  }), /*#__PURE__*/React.createElement(Stepper, {
    label: "Reps",
    value: s.r,
    onDecrement: () => setItems(adj(i, j, 'r', -1)),
    onIncrement: () => setItems(adj(i, j, 'r', 1))
  }), /*#__PURE__*/React.createElement(IconButton, {
    ariaLabel: "Copy set",
    variant: "ghost",
    style: {
      color: 'var(--accent)',
      marginBottom: 1
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "Copy",
    size: 16
  })))), /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    fullWidth: true,
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: "Plus",
      size: 16
    }),
    style: {
      border: '1px dashed var(--border-strong)',
      color: 'var(--text-secondary)'
    }
  }, "Add set"))), /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    fullWidth: true,
    size: "lg",
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: "Plus",
      size: 18
    })
  }, "Add Exercise"), /*#__PURE__*/React.createElement(Input, {
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: "Zap",
      size: 18
    }),
    placeholder: "Pre-workout fuel\u2026",
    value: w.fuel,
    onChange: () => {}
  }), /*#__PURE__*/React.createElement("textarea", {
    defaultValue: w.notes,
    placeholder: "Notes\u2026",
    rows: 3,
    style: {
      width: '100%',
      resize: 'none',
      padding: '12px 14px',
      borderRadius: 'var(--radius-md)',
      border: '1px solid var(--border-subtle)',
      background: 'var(--surface-card)',
      fontFamily: 'var(--font-sans)',
      fontSize: 'var(--text-sm)',
      color: 'var(--text-primary)',
      boxShadow: 'var(--shadow-xs)',
      outline: 'none'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'sticky',
      bottom: 0,
      padding: '12px 16px',
      background: 'linear-gradient(to top, var(--surface-page) 70%, transparent)'
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    fullWidth: true,
    size: "lg",
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: "Check",
      size: 18
    }),
    onClick: () => nav.go('today')
  }, "Save Workout")));
}
const adj = (i, j, k, dv) => p => p.map((ex, ii) => ii !== i ? ex : {
  ...ex,
  sets: ex.sets.map((s, jj) => jj !== j ? s : {
    ...s,
    [k]: Math.max(0, (Number(s[k]) || 0) + dv)
  })
});

// ========================= EXERCISES =========================
function ExercisesScreen({
  nav
}) {
  const {
    CategoryBadge,
    Input,
    Fab
  } = DS2;
  const [q, setQ] = React.useState('');
  const [filter, setFilter] = React.useState('all');
  const chips = [['all', 'All'], ['push', 'Push'], ['pull', 'Pull'], ['leg', 'Leg'], ['other', 'Other']];
  const list = LIBRARY.filter(e => filter === 'all' || e.category === filter).filter(e => !q || e.name.toLowerCase().includes(q.toLowerCase())).sort((a, b) => b.records - a.records);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      height: '100%',
      background: 'var(--surface-page)',
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "sd-no-scrollbar",
    style: {
      flex: 1,
      overflowY: 'auto'
    }
  }, /*#__PURE__*/React.createElement(TopBar, {
    title: "My Exercises",
    onBack: () => nav.go('today')
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'sticky',
      top: 56,
      zIndex: 10,
      background: 'rgba(247,248,250,0.92)',
      backdropFilter: 'blur(8px)',
      borderBottom: '1px solid var(--border-subtle)',
      padding: '12px 16px'
    }
  }, /*#__PURE__*/React.createElement(Input, {
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: "Search",
      size: 18
    }),
    placeholder: "Search exercises\u2026",
    value: q,
    onChange: e => setQ(e.target.value)
  }), /*#__PURE__*/React.createElement("div", {
    className: "sd-no-scrollbar",
    style: {
      display: 'flex',
      gap: 8,
      overflowX: 'auto',
      marginTop: 10
    }
  }, chips.map(([k, lb]) => {
    const on = filter === k;
    return /*#__PURE__*/React.createElement("button", {
      key: k,
      onClick: () => setFilter(k),
      style: {
        flexShrink: 0,
        height: 34,
        padding: '0 16px',
        borderRadius: 'var(--radius-md)',
        border: `1px solid ${on ? 'var(--accent)' : 'var(--border-subtle)'}`,
        background: on ? 'var(--accent)' : 'var(--surface-card)',
        color: on ? '#fff' : 'var(--text-secondary)',
        fontFamily: 'var(--font-sans)',
        fontSize: 'var(--text-xs)',
        fontWeight: 700,
        cursor: 'pointer'
      }
    }, lb);
  }))), /*#__PURE__*/React.createElement("main", {
    style: {
      padding: '12px 16px 96px',
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    }
  }, list.map(e => /*#__PURE__*/React.createElement("button", {
    key: e.name,
    onClick: () => nav.go('detail'),
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      width: '100%',
      padding: '14px',
      border: '1px solid var(--border-subtle)',
      background: 'var(--surface-card)',
      borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow-xs)',
      cursor: 'pointer',
      textAlign: 'left'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0,
      display: 'flex',
      flexDirection: 'column',
      gap: 4
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--text-sm)',
      fontWeight: 700,
      color: 'var(--text-primary)'
    }
  }, e.name), /*#__PURE__*/React.createElement(CategoryBadge, {
    category: e.category,
    size: "sm"
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--text-2xs)',
      color: 'var(--text-tertiary)'
    }
  }, e.records, " records \xB7 Last ", e.last, " \xB7 ", e.muscles.join(', '))), /*#__PURE__*/React.createElement(Icon, {
    name: "ChevronRight",
    size: 18,
    style: {
      color: 'var(--text-tertiary)'
    }
  }))))), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      right: 16,
      bottom: 16
    }
  }, /*#__PURE__*/React.createElement(Fab, {
    extended: true,
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: "Plus",
      size: 20
    })
  }, "New Exercise")));
}

// ---- shared top bar ----
function TopBar({
  title,
  onBack,
  right
}) {
  const {
    IconButton
  } = DS2;
  return /*#__PURE__*/React.createElement("header", {
    style: {
      position: 'sticky',
      top: 0,
      zIndex: 20,
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      padding: '10px 12px',
      background: 'rgba(247,248,250,0.92)',
      backdropFilter: 'blur(8px)',
      borderBottom: '1px solid var(--border-subtle)'
    }
  }, /*#__PURE__*/React.createElement(IconButton, {
    ariaLabel: "Back",
    variant: "ghost",
    onClick: onBack
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "ArrowLeft",
    size: 20
  })), /*#__PURE__*/React.createElement("h1", {
    style: {
      flex: 1,
      margin: 0,
      textAlign: 'center',
      fontSize: 'var(--text-base)',
      fontWeight: 700,
      color: 'var(--text-primary)'
    }
  }, title), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 40,
      display: 'flex',
      justifyContent: 'flex-end'
    }
  }, right));
}
Object.assign(window, {
  WorkoutDetailScreen,
  ExercisesScreen,
  TopBar
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/strength-data/screens-workout-exercises.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Fab = __ds_scope.Fab;

__ds_ns.IconButton = __ds_scope.IconButton;

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.CATEGORY_COLORS = __ds_scope.CATEGORY_COLORS;

__ds_ns.CategoryBadge = __ds_scope.CategoryBadge;

__ds_ns.SetChip = __ds_scope.SetChip;

__ds_ns.StatCard = __ds_scope.StatCard;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.SegmentedControl = __ds_scope.SegmentedControl;

__ds_ns.Stepper = __ds_scope.Stepper;

__ds_ns.Avatar = __ds_scope.Avatar;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.BottomNav = __ds_scope.BottomNav;

__ds_ns.WeekDay = __ds_scope.WeekDay;

__ds_ns.WeekStrip = __ds_scope.WeekStrip;

// components/data-display/AnimatedNumber.jsx
try { (() => {
function AnimatedNumber({ value = 0, duration = 900, decimals = 0, prefix = '', suffix = '', format = true, style = {} }) {
  const [display, setDisplay] = React.useState(0);
  const fromRef = React.useRef(0);
  const rafRef = React.useRef(null);
  React.useEffect(() => {
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const from = fromRef.current;
    const to = Number(value) || 0;
    if (reduce || duration <= 0) { setDisplay(to); fromRef.current = to; return; }
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(from + (to - from) * eased);
      if (p < 1) { rafRef.current = requestAnimationFrame(tick); } else { fromRef.current = to; }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value, duration]);
  const n = Number(display.toFixed(decimals));
  const text = format ? n.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) : n.toFixed(decimals);
  return /*#__PURE__*/React.createElement("span", { className: "sd-tnum", style: { fontVariantNumeric: 'tabular-nums', ...style } }, prefix, text, suffix);
}
Object.assign(__ds_scope, { AnimatedNumber });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data-display/AnimatedNumber.jsx", error: String((e && e.message) || e) }); }

// components/data-display/WorkoutTypeBadge.jsx
try { (() => {
const WORKOUT_TYPE_COLORS = {
  push: { tint: 'var(--push-tint)', fg: 'var(--push-700)', dot: 'var(--push-500)', label: 'Push' },
  pull: { tint: 'var(--pull-tint)', fg: 'var(--pull-700)', dot: 'var(--pull-500)', label: 'Pull' },
  leg: { tint: 'var(--leg-tint)', fg: 'var(--leg-700)', dot: 'var(--leg-500)', label: 'Leg' },
  other: { tint: 'var(--other-tint)', fg: 'var(--other-700)', dot: 'var(--other-500)', label: 'Other' },
  upper: { tint: 'var(--upper-tint)', fg: 'var(--upper-700)', dot: 'var(--upper-500)', label: 'Upper' },
  legPush: { tint: 'var(--legpush-tint)', fg: 'var(--legpush-700)', dot: 'var(--legpush-500)', label: 'Leg + Push' },
  legPull: { tint: 'var(--legpull-tint)', fg: 'var(--legpull-700)', dot: 'var(--legpull-500)', label: 'Leg + Pull' },
  full: { tint: 'var(--full-tint)', fg: 'var(--full-700)', dot: 'var(--full-500)', label: 'Full Body' },
};
function workoutTypeOf(focus = []) {
  const f = new Set(focus); const has = x => f.has(x);
  if (has('push') && has('pull') && has('leg')) return 'full';
  if (has('push') && has('pull')) return 'upper';
  if (has('leg') && has('push')) return 'legPush';
  if (has('leg') && has('pull')) return 'legPull';
  if (has('push')) return 'push'; if (has('pull')) return 'pull'; if (has('leg')) return 'leg';
  return 'other';
}
function WorkoutTypeBadge({ type, focus, label, dot = false, size = 'md', onClick, style = {} }) {
  const key = type || (focus ? workoutTypeOf(focus) : 'other');
  const c = WORKOUT_TYPE_COLORS[key] || WORKOUT_TYPE_COLORS.other;
  const sizes = { sm: { h: 20, font: 'var(--text-3xs)', pad: '0 8px' }, md: { h: 24, font: 'var(--text-2xs)', pad: '0 10px' } };
  const s = sizes[size] || sizes.md;
  const Tag = onClick ? 'button' : 'span';
  return /*#__PURE__*/React.createElement(Tag, { type: onClick ? 'button' : undefined, onClick, style: { display:'inline-flex',alignItems:'center',gap:5,height:s.h,padding:s.pad,border:'none',borderRadius:'var(--radius-full)',background:c.tint,color:c.fg,fontFamily:'var(--font-sans)',fontSize:s.font,fontWeight:'var(--weight-bold)',textTransform:'uppercase',letterSpacing:'0.04em',cursor:onClick?'pointer':'default',WebkitTapHighlightColor:'transparent',...style } },
    dot && /*#__PURE__*/React.createElement("span", { style:{width:6,height:6,borderRadius:'50%',background:c.dot,flexShrink:0} }),
    label || c.label
  );
}
Object.assign(__ds_scope, { WORKOUT_TYPE_COLORS, workoutTypeOf, WorkoutTypeBadge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data-display/WorkoutTypeBadge.jsx", error: String((e && e.message) || e) }); }

// components/feedback/EmptyState.jsx
try { (() => {
function EmptyState({ icon = null, title, subtitle, action = null, tone = 'neutral', style = {} }) {
  const tones = { neutral: { bg:'var(--surface-sunken)',fg:'var(--text-tertiary)' }, accent: { bg:'var(--accent-tint)',fg:'var(--accent-hover)' } };
  const t = tones[tone] || tones.neutral;
  return /*#__PURE__*/React.createElement("div", { className:"sd-slide-in", style:{display:'flex',flexDirection:'column',alignItems:'center',textAlign:'center',gap:6,padding:'36px 24px',...style} },
    icon && /*#__PURE__*/React.createElement("span", { style:{display:'inline-flex',alignItems:'center',justifyContent:'center',width:60,height:60,borderRadius:'var(--radius-xl)',background:t.bg,color:t.fg,marginBottom:6} }, icon),
    /*#__PURE__*/React.createElement("h3", { style:{margin:0,fontSize:'var(--text-base)',fontWeight:700,color:'var(--text-primary)'} }, title),
    subtitle && /*#__PURE__*/React.createElement("p", { style:{margin:0,maxWidth:280,fontSize:'var(--text-sm)',color:'var(--text-secondary)',lineHeight:1.5} }, subtitle),
    action && /*#__PURE__*/React.createElement("div", { style:{marginTop:12} }, action)
  );
}
Object.assign(__ds_scope, { EmptyState });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/EmptyState.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Modal.jsx
try { (() => {
function Modal({ open, onClose, title, subtitle, eyebrow, headerRight=null, variant='sheet', children, footer=null, maxWidth=420, contained=true }) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = e => { if (e.key === 'Escape') onClose && onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open) return null;
  const isSheet = variant === 'sheet';
  return /*#__PURE__*/React.createElement("div", { style:{position:contained?'absolute':'fixed',inset:0,zIndex:60,display:'flex',alignItems:isSheet?'flex-end':'center',justifyContent:'center',padding:isSheet?0:18} },
    /*#__PURE__*/React.createElement("div", { onClick:onClose, style:{position:'absolute',inset:0,background:'rgba(31,41,55,0.34)',animation:'sd-fade-in var(--dur-base) var(--ease-standard)'} }),
    /*#__PURE__*/React.createElement("div", { role:"dialog","aria-modal":"true", style:{position:'relative',width:'100%',maxWidth:isSheet?'100%':maxWidth,maxHeight:isSheet?'86%':'88%',display:'flex',flexDirection:'column',background:'var(--surface-card)',borderRadius:isSheet?'var(--radius-2xl) var(--radius-2xl) 0 0':'var(--radius-2xl)',boxShadow:'var(--shadow-xl)',paddingBottom:16,animation:isSheet?'sd-sheet-up var(--dur-slow) var(--ease-out)':'sd-pop-in var(--dur-slow) var(--ease-spring)'} },
      isSheet && /*#__PURE__*/React.createElement("div", {style:{display:'flex',justifyContent:'center',paddingTop:10}}, /*#__PURE__*/React.createElement("div",{style:{width:38,height:4,borderRadius:2,background:'var(--gray-200)'}})),
      (title||headerRight) && /*#__PURE__*/React.createElement("div", {style:{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:10,padding:isSheet?'12px 18px 14px':'18px 18px 14px'}},
        /*#__PURE__*/React.createElement("div", null,
          eyebrow && /*#__PURE__*/React.createElement("div", {className:"sd-eyebrow",style:{color:'var(--accent)',marginBottom:4}}, eyebrow),
          title && /*#__PURE__*/React.createElement("h3", {style:{margin:0,fontSize:'var(--text-xl)',fontWeight:800,letterSpacing:'-0.01em',color:'var(--text-primary)'}}, title),
          subtitle && /*#__PURE__*/React.createElement("p", {style:{margin:'3px 0 0',fontSize:'var(--text-xs)',color:'var(--text-secondary)'}}, subtitle)
        ),
        /*#__PURE__*/React.createElement("div", {style:{display:'flex',alignItems:'center',gap:8,flexShrink:0}}, headerRight)
      ),
      /*#__PURE__*/React.createElement("div", {className:"sd-no-scrollbar",style:{overflowY:'auto',padding:'0 18px',flex:'0 1 auto'}}, children),
      footer && /*#__PURE__*/React.createElement("div", {style:{padding:'14px 18px 0'}}, footer)
    )
  );
}
Object.assign(__ds_scope, { Modal });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Modal.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Skeleton.jsx
try { (() => {
function Skeleton({ variant='line', width='100%', height, radius, style={} }) {
  const presets = { line:{width,height:height||12,radius:radius||'var(--radius-sm)'}, text:{width,height:height||14,radius:radius||'4px'}, title:{width:width||'60%',height:height||20,radius:radius||'var(--radius-sm)'}, chip:{width:width||64,height:height||26,radius:radius||'var(--radius-full)'}, block:{width,height:height||80,radius:radius||'var(--radius-lg)'}, card:{width,height:height||120,radius:radius||'var(--radius-2xl)'}, avatar:{width:width||40,height:height||40,radius:radius||'var(--radius-full)'} };
  const p = presets[variant] || presets.line;
  return /*#__PURE__*/React.createElement("div", { className:"sd-shimmer","aria-hidden":"true", style:{width:p.width,height:p.height,borderRadius:p.radius,flexShrink:0,...style} });
}
function SkeletonGroup({ lines=3, gap=10, lastWidth='70%', style={} }) {
  return /*#__PURE__*/React.createElement("div", {style:{display:'flex',flexDirection:'column',gap,...style}},
    Array.from({length:lines}).map((_,i) => /*#__PURE__*/React.createElement(Skeleton,{key:i,variant:"text",width:i===lines-1?lastWidth:'100%'}))
  );
}
Object.assign(__ds_scope, { Skeleton, SkeletonGroup });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Skeleton.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Toast.jsx
try { (() => {
const _TONES = { success:{bar:'var(--green-500)',tint:'var(--green-tint)'}, error:{bar:'var(--red-500)',tint:'var(--red-tint)'}, info:{bar:'var(--accent)',tint:'var(--accent-tint)'} };
function Toast({ tone='info', title, message, icon=null, onClose, style={} }) {
  const t = _TONES[tone] || _TONES.info;
  return /*#__PURE__*/React.createElement("div", {role:"status",style:{display:'flex',alignItems:'flex-start',gap:10,width:'100%',padding:'12px 14px',background:'var(--surface-card)',border:'1px solid var(--border-subtle)',borderLeft:`3px solid ${t.bar}`,borderRadius:'var(--radius-md)',boxShadow:'var(--shadow-lg)',animation:'sd-toast-in var(--dur-slow) var(--ease-out)',...style}},
    /*#__PURE__*/React.createElement("span",{style:{display:'inline-flex',alignItems:'center',justifyContent:'center',width:24,height:24,borderRadius:'var(--radius-sm)',background:t.tint,color:t.bar,flexShrink:0,marginTop:1}},icon),
    /*#__PURE__*/React.createElement("div",{style:{flex:1,minWidth:0}},
      title&&/*#__PURE__*/React.createElement("div",{style:{fontSize:'var(--text-sm)',fontWeight:700,color:'var(--text-primary)'}},title),
      message&&/*#__PURE__*/React.createElement("div",{style:{fontSize:'var(--text-xs)',color:'var(--text-secondary)',marginTop:title?1:0}},message)
    ),
    onClose&&/*#__PURE__*/React.createElement("button",{onClick:onClose,"aria-label":"Dismiss",style:{border:'none',background:'none',padding:2,cursor:'pointer',color:'var(--text-tertiary)',flexShrink:0}},'×')
  );
}
function useToasts(defaultDuration=2600) {
  const [toasts,setToasts]=React.useState([]);
  const dismiss=React.useCallback(id=>setToasts(t=>t.filter(x=>x.id!==id)),[]);
  const push=React.useCallback(toast=>{
    const id=Math.random().toString(36).slice(2);
    setToasts(t=>[...t,{...toast,id}]);
    const dur=toast.duration||defaultDuration;
    if(dur>0)setTimeout(()=>dismiss(id),dur);
    return id;
  },[defaultDuration,dismiss]);
  const ToastDock=React.useCallback(({renderIcon})=>/*#__PURE__*/React.createElement("div",{style:{position:'absolute',top:12,left:12,right:12,zIndex:80,display:'flex',flexDirection:'column',gap:8,pointerEvents:'none'}},
    toasts.map(t=>/*#__PURE__*/React.createElement("div",{key:t.id,style:{pointerEvents:'auto'}},
      /*#__PURE__*/React.createElement(Toast,{tone:t.tone,title:t.title,message:t.message,icon:t.icon||(renderIcon?renderIcon(t):null),onClose:()=>dismiss(t.id)})
    ))
  ),[toasts,dismiss]);
  return {toasts,push,dismiss,ToastDock};
}
Object.assign(__ds_scope, { Toast, useToasts });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Toast.jsx", error: String((e && e.message) || e) }); }

// components/forms/FilterChip.jsx
try { (() => {
function FilterChip({ label, active=false, onClick, accent=null, icon=null, count=null, size='md', style={} }) {
  const sizes={sm:{h:30,font:'var(--text-2xs)',pad:'0 12px'},md:{h:34,font:'var(--text-xs)',pad:'0 16px'}};
  const s=sizes[size]||sizes.md; const fill=accent||'var(--accent)';
  return /*#__PURE__*/React.createElement("button",{type:"button",onClick,"aria-pressed":active,className:"sd-focus-ring",
    style:{display:'inline-flex',alignItems:'center',gap:6,flexShrink:0,height:s.h,padding:s.pad,border:`1px solid ${active?fill:'var(--border-subtle)'}`,borderRadius:'var(--radius-full)',background:active?fill:'var(--surface-card)',color:active?'#fff':'var(--text-secondary)',fontFamily:'var(--font-sans)',fontSize:s.font,fontWeight:'var(--weight-bold)',cursor:'pointer',transition:'background var(--dur-fast) var(--ease-standard), border-color var(--dur-fast) var(--ease-standard), color var(--dur-fast) var(--ease-standard)',WebkitTapHighlightColor:'transparent',...style},
    onMouseDown:e=>{e.currentTarget.style.transform='scale(var(--press-scale))'},
    onMouseUp:e=>{e.currentTarget.style.transform='scale(1)'},
    onMouseLeave:e=>{e.currentTarget.style.transform='scale(1)'}
  },
    icon&&/*#__PURE__*/React.createElement("span",{style:{display:'inline-flex'}},icon),
    label,
    count!=null&&/*#__PURE__*/React.createElement("span",{className:"sd-tnum",style:{fontSize:'var(--text-3xs)',fontWeight:700,opacity:active?0.85:0.6}},count)
  );
}
Object.assign(__ds_scope, { FilterChip });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/FilterChip.jsx", error: String((e && e.message) || e) }); }

// components/forms/Switch.jsx
try { (() => {
function Switch({ checked=false, onChange, disabled=false, ariaLabel, size='md', style={} }) {
  const dims={sm:{w:38,h:22,k:16},md:{w:46,h:28,k:22}};
  const d=dims[size]||dims.md; const pad=(d.h-d.k)/2;
  return /*#__PURE__*/React.createElement("button",{type:"button",role:"switch","aria-checked":checked,"aria-label":ariaLabel,disabled,onClick:()=>!disabled&&onChange&&onChange(!checked),className:"sd-focus-ring",
    style:{position:'relative',width:d.w,height:d.h,flexShrink:0,padding:0,border:'none',borderRadius:'var(--radius-full)',background:checked?'var(--accent)':'var(--gray-300)',cursor:disabled?'not-allowed':'pointer',opacity:disabled?0.5:1,transition:'background var(--dur-base) var(--ease-standard)',WebkitTapHighlightColor:'transparent',...style}
  },
    /*#__PURE__*/React.createElement("span",{style:{position:'absolute',top:pad,left:checked?d.w-d.k-pad:pad,width:d.k,height:d.k,borderRadius:'50%',background:'#fff',boxShadow:'var(--shadow-sm)',transition:'left var(--dur-base) var(--ease-spring)'}})
  );
}
Object.assign(__ds_scope, { Switch });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Switch.jsx", error: String((e && e.message) || e) }); }

__ds_ns.AnimatedNumber = __ds_scope.AnimatedNumber;
__ds_ns.WORKOUT_TYPE_COLORS = __ds_scope.WORKOUT_TYPE_COLORS;
__ds_ns.workoutTypeOf = __ds_scope.workoutTypeOf;
__ds_ns.WorkoutTypeBadge = __ds_scope.WorkoutTypeBadge;
__ds_ns.EmptyState = __ds_scope.EmptyState;
__ds_ns.Modal = __ds_scope.Modal;
__ds_ns.Skeleton = __ds_scope.Skeleton;
__ds_ns.SkeletonGroup = __ds_scope.SkeletonGroup;
__ds_ns.Toast = __ds_scope.Toast;
__ds_ns.useToasts = __ds_scope.useToasts;
__ds_ns.FilterChip = __ds_scope.FilterChip;
__ds_ns.Switch = __ds_scope.Switch;

})();
