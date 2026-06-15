/* Login + Today screens for the Strength Data UI kit. */
const DS = window.StrengthDataDesignSystem_5c629b;

// ============================ LOGIN ============================
function LoginScreen({ nav }) {
  const { Button, Input, IconButton } = DS;
  const [isLogin, setIsLogin] = React.useState(true);
  const [show, setShow] = React.useState(false);
  const [email, setEmail] = React.useState('ahmet@example.com');
  const [pw, setPw] = React.useState('strongpass');
  const [name, setName] = React.useState('');

  return (
    <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '24px 20px', background: 'var(--surface-page)' }}>
      <div className="sd-slide-in" style={{ width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: 26 }}>
          <img src="../../assets/mark-app.svg" width="60" height="60" style={{ borderRadius: 18, boxShadow: 'var(--shadow-md)' }} alt="Strength Data" />
          <h1 style={{ margin: '16px 0 6px', fontSize: 'var(--text-2xl)', fontWeight: 800, letterSpacing: '-.02em', color: 'var(--text-primary)' }}>
            {isLogin ? 'Welcome back' : 'Create your account'}
          </h1>
          <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', fontWeight: 500 }}>
            {isLogin ? 'Pick up your training right where you left off' : 'Start tracking your progress today'}
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {!isLogin && (
            <Input icon={<Icon name="User" size={18} />} placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} />
          )}
          <Input icon={<Icon name="Mail" size={18} />} placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input
            type={show ? 'text' : 'password'}
            icon={<Icon name="Lock" size={18} />}
            placeholder="Password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            trailing={<IconButton ariaLabel="Toggle password" variant="ghost" size="sm" onClick={() => setShow((s) => !s)}><Icon name={show ? 'EyeOff' : 'Eye'} size={18} /></IconButton>}
          />
          <Button variant="primary" fullWidth size="lg" trailingIcon={<Icon name="ArrowRight" size={16} />} onClick={() => nav.go('today')} style={{ marginTop: 4 }}>
            {isLogin ? 'Sign in' : 'Create account'}
          </Button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
          <div style={{ flex: 1, height: 1, background: 'var(--border-subtle)' }} />
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', fontWeight: 600 }}>or</span>
          <div style={{ flex: 1, height: 1, background: 'var(--border-subtle)' }} />
        </div>

        <Button variant="secondary" fullWidth size="lg" onClick={() => nav.go('today')}
          icon={<img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" width="18" height="18" alt="" />}>
          Continue with Google
        </Button>

        <p style={{ textAlign: 'center', marginTop: 22, fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', fontWeight: 500 }}>
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <button onClick={() => setIsLogin((v) => !v)} style={{ border: 'none', background: 'none', padding: 0, cursor: 'pointer', color: 'var(--text-link)', fontWeight: 700, fontFamily: 'var(--font-sans)', fontSize: 'inherit' }}>
            {isLogin ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );
}

// ============================ TODAY ============================
function TodayScreen({ nav }) {
  const { Card, CategoryBadge, Badge, SetChip, IconButton, Avatar, BottomNav, WeekDay } = DS;
  const w = TODAY_WORKOUT;
  const [selected, setSelected] = React.useState('2026-06-15');
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [picker, setPicker] = React.useState(false);
  const [edit, setEdit] = React.useState(null); // exercise being quick-edited

  return (
    <div style={{ height: '100%', background: 'var(--surface-page)', position: 'relative', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div className="sd-no-scrollbar" style={{ flex: 1, overflowY: 'auto' }}>
      {/* Header */}
      <header style={{ position: 'sticky', top: 0, zIndex: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: 'rgba(247,248,250,0.9)', backdropFilter: 'saturate(180%) blur(8px)', borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src="../../assets/mark-app.svg" width="38" height="38" style={{ borderRadius: 11 }} alt="Strength Data" />
          <div>
            <div style={{ fontSize: 'var(--text-lg)', fontWeight: 800, letterSpacing: '-.02em', color: 'var(--text-primary)', lineHeight: 1.05 }}>{w.dateLabel}</div>
            <div className="sd-eyebrow" style={{ marginTop: 2 }}>{w.weekday} · 2026</div>
          </div>
        </div>
        <div style={{ position: 'relative' }}>
          <button onClick={() => setMenuOpen((o) => !o)} style={{ border: 'none', background: 'none', padding: 0, cursor: 'pointer', borderRadius: '50%' }} aria-label="Profile menu">
            <Avatar name={USER.name} size={40} />
          </button>
          {menuOpen && (
            <>
              <div onClick={() => setMenuOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 30 }} />
              <div className="sd-slide-in" style={{ position: 'absolute', right: 0, top: 48, zIndex: 31, width: 200, background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)', padding: 6 }}>
                {[['CalendarDays', 'Calendar'], ['MessageSquare', 'Feedback'], ['User', 'Profile']].map(([ic, lb]) => (
                  <button key={lb} onClick={() => { setMenuOpen(false); if (lb === 'Profile') nav.go('profile'); }} style={menuItemStyle}>
                    <Icon name={ic} size={18} style={{ color: 'var(--text-secondary)' }} />{lb}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </header>

      {/* Week strip */}
      <div style={{ position: 'sticky', top: 67, zIndex: 10, background: 'rgba(247,248,250,0.9)', backdropFilter: 'blur(8px)', borderBottom: '1px solid var(--border-subtle)', padding: '10px 0' }}>
        <div className="sd-no-scrollbar" style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '0 16px' }}>
          {WEEK.map((day) => (
            <WeekDay key={day.iso} weekday={day.wd} day={day.d} category={day.category} caption={day.caption}
              selected={selected === day.iso} onClick={() => setSelected(day.iso)} />
          ))}
        </div>
      </div>

      {/* Main */}
      <main style={{ padding: '16px 16px 110px' }}>
        <Card pad="md" className="sd-slide-in" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* card header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, paddingBottom: 12, borderBottom: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <CategoryBadge category={w.category} onClick={() => {}} />
              <BodyWeightBadge value={w.bodyWeight} />
            </div>
            <IconButton ariaLabel="Edit workout" variant="soft" size="sm" onClick={() => nav.go('workout')}><Icon name="Pencil" size={16} /></IconButton>
          </div>

          {/* exercise rows */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {w.items.map((ex, i) => (
              <button key={i} onClick={() => setEdit(ex)} style={rowBtnStyle}>
                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <span style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--text-primary)' }}>{ex.name}</span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {ex.sets.map((s, j) => (
                      <SetChip key={j} reps={s.r} weight={s.w} pr={s.pr || 'none'} trophy={s.pr ? <Icon name="Trophy" size={11} /> : null} />
                    ))}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-tertiary)' }}>
                  <span className="sd-eyebrow">{ex.sets.length} sets</span>
                  <Icon name="ChevronRight" size={18} />
                </div>
              </button>
            ))}
          </div>

          {/* fuel */}
          <Card tint="accent" pad="sm" style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            <Icon name="Zap" size={16} style={{ color: 'var(--accent-hover)', marginTop: 1 }} />
            <div>
              <div style={{ fontSize: 'var(--text-2xs)', fontWeight: 700, color: 'var(--accent-hover)', textTransform: 'uppercase', letterSpacing: '.04em' }}>Fuel</div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-700)', marginTop: 2 }}>{w.fuel}</div>
            </div>
          </Card>
          {/* notes */}
          <Card tint="sunken" pad="sm">
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-600)' }}>{w.notes}</div>
          </Card>
        </Card>
      </main>

      </div>

      {/* Bottom nav */}
      <div style={{ position: 'absolute', left: 16, right: 16, bottom: 16, zIndex: 15 }}>
        <BottomNav
          activeKey="today"
          onSelect={(k) => { if (k === 'exercises') nav.go('exercises'); }}
          items={[
            { key: 'today', label: 'Today', icon: <Icon name="CalendarDays" size={20} /> },
            { key: 'exercises', label: 'Exercises', icon: <Icon name="ListChecks" size={20} /> },
          ]}
          primary={{ label: 'Add Exercise', icon: <Icon name="Plus" size={22} />, onClick: () => setPicker(true) }}
        />
      </div>

      {picker && <ExercisePicker onClose={() => setPicker(false)} />}
      {edit && <QuickEdit exercise={edit} nav={nav} onClose={() => setEdit(null)} />}
    </div>
  );
}

function BodyWeightBadge({ value }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, height: 24, padding: '0 10px', borderRadius: 'var(--radius-full)', background: 'var(--surface-sunken)', border: '1px solid var(--border-subtle)', fontSize: 'var(--text-2xs)', fontWeight: 700, color: 'var(--text-secondary)' }}>
      <Icon name="Scale" size={13} style={{ color: 'var(--accent)' }} />
      <span className="sd-tnum">{value} kg</span>
    </span>
  );
}

// ---- Exercise picker modal ----
function ExercisePicker({ onClose }) {
  const { Input, CategoryBadge } = DS;
  const [q, setQ] = React.useState('');
  const list = LIBRARY.filter((e) => !q || e.name.toLowerCase().includes(q.toLowerCase()) || e.muscles.join(' ').toLowerCase().includes(q.toLowerCase()));
  return (
    <Sheet onClose={onClose} title="Add Exercise" subtitle="Pick from your library or add a new one">
      <div style={{ padding: '0 16px 12px' }}>
        <Input icon={<Icon name="Search" size={18} />} placeholder="Search exercises…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <div className="sd-no-scrollbar" style={{ overflowY: 'auto', flex: 1, padding: '0 8px 8px' }}>
        {list.map((e) => (
          <button key={e.name} onClick={onClose} style={pickRowStyle}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
              <span style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--text-primary)' }}>{e.name}</span>
              <span style={{ fontSize: 'var(--text-2xs)', color: 'var(--text-tertiary)' }}>{e.muscles.join(', ')}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <CategoryBadge category={e.category} size="sm" />
              <Icon name="Plus" size={18} style={{ color: 'var(--accent)' }} />
            </div>
          </button>
        ))}
        <button onClick={onClose} style={{ ...pickRowStyle, justifyContent: 'center', gap: 6, color: 'var(--text-link)', fontWeight: 700 }}>
          <Icon name="Plus" size={16} />New / manual exercise
        </button>
      </div>
    </Sheet>
  );
}

// ---- Quick edit modal ----
function QuickEdit({ exercise, nav, onClose }) {
  const { Stepper, Button, IconButton } = DS;
  const [sets, setSets] = React.useState(exercise.sets.map((s) => ({ ...s })));
  const upd = (i, k, dv) => setSets((p) => p.map((s, j) => j === i ? { ...s, [k]: Math.max(0, (Number(s[k]) || 0) + dv) } : s));
  return (
    <Sheet onClose={onClose} eyebrow="Edit" title={exercise.name}
      headerRight={<Button variant="secondary" size="sm" icon={<Icon name="ExternalLink" size={14} />} onClick={() => { onClose(); nav.go('detail'); }}>Detail</Button>}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '0 16px 4px' }}>
        {sets.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
            <span style={{ width: 16, textAlign: 'center', fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-tertiary)', paddingBottom: 11 }}>{i + 1}</span>
            <Stepper label="kg" value={s.w} onDecrement={() => upd(i, 'w', -2.5)} onIncrement={() => upd(i, 'w', 2.5)} />
            <Stepper label="Reps" value={s.r} onDecrement={() => upd(i, 'r', -1)} onIncrement={() => upd(i, 'r', 1)} />
            <IconButton ariaLabel="Delete set" variant="ghost" onClick={() => setSets((p) => p.filter((_, j) => j !== i))} style={{ color: 'var(--red-500)', marginBottom: 1 }}><Icon name="Trash2" size={18} /></IconButton>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 10, padding: '14px 16px 4px' }}>
        <Button variant="secondary" onClick={() => setSets((p) => [...p, { w: p.length ? p[p.length - 1].w : 20, r: p.length ? p[p.length - 1].r : 10 }])} icon={<Icon name="Plus" size={16} />} fullWidth>Add set</Button>
      </div>
      <div style={{ padding: '8px 16px 4px' }}>
        <Button variant="primary" fullWidth size="lg" onClick={onClose}>Save &amp; close</Button>
      </div>
    </Sheet>
  );
}

// ---- shared bottom sheet ----
function Sheet({ children, onClose, title, subtitle, eyebrow, headerRight }) {
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 40, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(31,41,55,0.32)' }} />
      <div className="sd-slide-in" style={{ position: 'relative', width: '100%', maxHeight: '82%', display: 'flex', flexDirection: 'column', background: 'var(--surface-card)', borderTopLeftRadius: 'var(--radius-2xl)', borderTopRightRadius: 'var(--radius-2xl)', boxShadow: 'var(--shadow-xl)', paddingBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 10 }}><div style={{ width: 38, height: 4, borderRadius: 2, background: 'var(--gray-200)' }} /></div>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, padding: '12px 16px 14px' }}>
          <div>
            {eyebrow && <div className="sd-eyebrow" style={{ color: 'var(--accent)', marginBottom: 3 }}>{eyebrow}</div>}
            <h3 style={{ margin: 0, fontSize: 'var(--text-xl)', fontWeight: 800, letterSpacing: '-.01em', color: 'var(--text-primary)' }}>{title}</h3>
            {subtitle && <p style={{ margin: '3px 0 0', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>{subtitle}</p>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {headerRight}
            <DS.IconButton ariaLabel="Close" variant="soft" onClick={onClose}><Icon name="X" size={18} /></DS.IconButton>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}

const menuItemStyle = { display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '10px 12px', border: 'none', background: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)', textAlign: 'left' };
const rowBtnStyle = { display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '12px', border: '1px solid var(--border-subtle)', background: 'var(--surface-card)', borderRadius: 'var(--radius-lg)', cursor: 'pointer', textAlign: 'left', WebkitTapHighlightColor: 'transparent' };
const pickRowStyle = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, width: '100%', padding: '12px', border: 'none', background: 'none', borderRadius: 'var(--radius-lg)', cursor: 'pointer', textAlign: 'left' };

Object.assign(window, { LoginScreen, TodayScreen });
