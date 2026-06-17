/* Workout Detail + Exercises screens for the Strength Data UI kit. */
const DS2 = window.StrengthDataDesignSystem_5c629b;

// ====================== WORKOUT DETAIL ======================
function WorkoutDetailScreen({ nav }) {
  const { Card, Button, IconButton, Stepper, Input } = DS2;
  const w = TODAY_WORKOUT;
  const [focus, setFocus] = React.useState(['push']);
  const [items, setItems] = React.useState(w.items.slice(0, 3).map((x) => ({ ...x, sets: x.sets.map((s) => ({ ...s })) })));
  const toggleFocus = (k) => setFocus((p) => p.includes(k) ? p.filter((x) => x !== k) : [...p, k]);

  return (
    <div style={{ height: '100%', background: 'var(--surface-page)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <TopBar title="Workout Detail" onBack={() => nav.go('today')}
        right={<IconButton ariaLabel="Delete workout" variant="ghost" style={{ color: 'var(--red-500)' }}><Icon name="Trash2" size={18} /></IconButton>} />

      <main style={{ flex: 1, padding: '16px 16px 96px', display: 'flex', flexDirection: 'column', gap: 14, overflowY: 'auto' }}>
        {/* date + move */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 'var(--text-3xl)', fontWeight: 800, letterSpacing: '-.02em', color: 'var(--text-primary)' }}>{w.dateLabel}</h1>
            <div className="sd-eyebrow" style={{ marginTop: 2 }}>{w.weekday} · 2026</div>
          </div>
          <IconButton ariaLabel="Move workout" variant="outline"><Icon name="CalendarDays" size={18} /></IconButton>
        </div>

        {/* focus multiselect */}
        <div style={{ display: 'flex', gap: 8 }}>
          {[['push', 'Push'], ['pull', 'Pull'], ['leg', 'Leg']].map(([k, lb]) => {
            const on = focus.includes(k);
            const colors = { push: ['var(--push-tint)', 'var(--push-700)', 'var(--push-500)'], pull: ['var(--pull-tint)', 'var(--pull-700)', 'var(--pull-500)'], leg: ['var(--leg-tint)', 'var(--leg-700)', 'var(--leg-500)'] }[k];
            return (
              <button key={k} onClick={() => toggleFocus(k)} style={{ flex: 1, height: 44, borderRadius: 'var(--radius-md)', border: `1px solid ${on ? colors[2] : 'var(--border-subtle)'}`, background: on ? colors[0] : 'var(--surface-card)', color: on ? colors[1] : 'var(--text-secondary)', fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', fontWeight: 700, cursor: 'pointer' }}>{lb}</button>
            );
          })}
        </div>
        <Button variant="ghost" icon={<Icon name="History" size={16} />} style={{ alignSelf: 'flex-start', color: 'var(--text-link)' }}>Load from history</Button>

        {/* exercise editors */}
        {items.map((ex, i) => (
          <Card key={i} pad="md" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <button onClick={() => nav.go('detail')} style={{ border: 'none', background: 'none', padding: 0, cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--text-primary)' }}>{ex.name}</button>
              <IconButton ariaLabel="Edit exercise" variant="soft" size="sm"><Icon name="SlidersHorizontal" size={16} /></IconButton>
            </div>
            {ex.sets.map((s, j) => (
              <div key={j} style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
                <span style={{ width: 14, textAlign: 'center', fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-tertiary)', paddingBottom: 11 }}>{j + 1}</span>
                <Stepper label="kg" value={s.w} onDecrement={() => setItems(adj(i, j, 'w', -2.5))} onIncrement={() => setItems(adj(i, j, 'w', 2.5))} />
                <Stepper label="Reps" value={s.r} onDecrement={() => setItems(adj(i, j, 'r', -1))} onIncrement={() => setItems(adj(i, j, 'r', 1))} />
                <IconButton ariaLabel="Copy set" variant="ghost" style={{ color: 'var(--accent)', marginBottom: 1 }}><Icon name="Copy" size={16} /></IconButton>
              </div>
            ))}
            <Button variant="ghost" fullWidth icon={<Icon name="Plus" size={16} />} style={{ border: '1px dashed var(--border-strong)', color: 'var(--text-secondary)' }}>Add set</Button>
          </Card>
        ))}

        <Button variant="secondary" fullWidth size="lg" icon={<Icon name="Plus" size={18} />}>Add Exercise</Button>

        <Input icon={<Icon name="Zap" size={18} />} placeholder="Pre-workout fuel…" value={w.fuel} onChange={() => {}} />
        <textarea defaultValue={w.notes} placeholder="Notes…" rows={3} style={{ width: '100%', resize: 'none', padding: '12px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', background: 'var(--surface-card)', fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', color: 'var(--text-primary)', boxShadow: 'var(--shadow-xs)', outline: 'none' }} />
      </main>

      {/* sticky save */}
      <div style={{ position: 'sticky', bottom: 0, padding: '12px 16px', background: 'linear-gradient(to top, var(--surface-page) 70%, transparent)' }}>
        <Button variant="primary" fullWidth size="lg" icon={<Icon name="Check" size={18} />} onClick={() => nav.go('today')}>Save Workout</Button>
      </div>
    </div>
  );
}

const adj = (i, j, k, dv) => (p) => p.map((ex, ii) => ii !== i ? ex : { ...ex, sets: ex.sets.map((s, jj) => jj !== j ? s : { ...s, [k]: Math.max(0, (Number(s[k]) || 0) + dv) }) });

// ========================= EXERCISES =========================
function ExercisesScreen({ nav }) {
  const { CategoryBadge, Input, Fab } = DS2;
  const [q, setQ] = React.useState('');
  const [filter, setFilter] = React.useState('all');
  const chips = [['all', 'All'], ['push', 'Push'], ['pull', 'Pull'], ['leg', 'Leg'], ['other', 'Other']];
  const list = LIBRARY
    .filter((e) => filter === 'all' || e.category === filter)
    .filter((e) => !q || e.name.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => b.records - a.records);

  return (
    <div style={{ height: '100%', background: 'var(--surface-page)', position: 'relative', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div className="sd-no-scrollbar" style={{ flex: 1, overflowY: 'auto' }}>
      <TopBar title="My Exercises" onBack={() => nav.go('today')} />
      {/* sticky search + filters */}
      <div style={{ position: 'sticky', top: 56, zIndex: 10, background: 'rgba(247,248,250,0.92)', backdropFilter: 'blur(8px)', borderBottom: '1px solid var(--border-subtle)', padding: '12px 16px' }}>
        <Input icon={<Icon name="Search" size={18} />} placeholder="Search exercises…" value={q} onChange={(e) => setQ(e.target.value)} />
        <div className="sd-no-scrollbar" style={{ display: 'flex', gap: 8, overflowX: 'auto', marginTop: 10 }}>
          {chips.map(([k, lb]) => {
            const on = filter === k;
            return (
              <button key={k} onClick={() => setFilter(k)} style={{ flexShrink: 0, height: 34, padding: '0 16px', borderRadius: 'var(--radius-md)', border: `1px solid ${on ? 'var(--accent)' : 'var(--border-subtle)'}`, background: on ? 'var(--accent)' : 'var(--surface-card)', color: on ? '#fff' : 'var(--text-secondary)', fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', fontWeight: 700, cursor: 'pointer' }}>{lb}</button>
            );
          })}
        </div>
      </div>

      <main style={{ padding: '12px 16px 96px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {list.map((e) => (
          <button key={e.name} onClick={() => nav.go('detail')} style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '14px', border: '1px solid var(--border-subtle)', background: 'var(--surface-card)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-xs)', cursor: 'pointer', textAlign: 'left' }}>
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--text-primary)' }}>{e.name}</span>
                <CategoryBadge category={e.category} size="sm" />
              </div>
              <span style={{ fontSize: 'var(--text-2xs)', color: 'var(--text-tertiary)' }}>{e.records} records · Last {e.last} · {e.muscles.join(', ')}</span>
            </div>
            <Icon name="ChevronRight" size={18} style={{ color: 'var(--text-tertiary)' }} />
          </button>
        ))}
      </main>
      </div>

      <div style={{ position: 'absolute', right: 16, bottom: 16 }}>
        <Fab extended icon={<Icon name="Plus" size={20} />}>New Exercise</Fab>
      </div>
    </div>
  );
}

// ---- shared top bar ----
function TopBar({ title, onBack, right }) {
  const { IconButton } = DS2;
  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 20, display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', background: 'rgba(247,248,250,0.92)', backdropFilter: 'blur(8px)', borderBottom: '1px solid var(--border-subtle)' }}>
      <IconButton ariaLabel="Back" variant="ghost" onClick={onBack}><Icon name="ArrowLeft" size={20} /></IconButton>
      <h1 style={{ flex: 1, margin: 0, textAlign: 'center', fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--text-primary)' }}>{title}</h1>
      <div style={{ width: 40, display: 'flex', justifyContent: 'flex-end' }}>{right}</div>
    </header>
  );
}

Object.assign(window, { WorkoutDetailScreen, ExercisesScreen, TopBar });
