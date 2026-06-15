/* Exercise Detail + Profile screens for the Strength Data UI kit. */
const DS3 = window.StrengthDataDesignSystem_5c629b;

// ===================== EXERCISE DETAIL =====================
function ExerciseDetailScreen({ nav }) {
  const { Card, StatCard, SegmentedControl, IconButton, SetChip, Badge } = DS3;
  const d = BENCH_DETAIL;
  const [metric, setMetric] = React.useState('oneRm');
  const [range, setRange] = React.useState('1m');
  const metricMap = { weight: { key: 'weight', color: 'var(--blue-500)', label: 'Weight', unit: 'kg' }, oneRm: { key: 'oneRm', color: 'var(--leg-500)', label: '1RM', unit: 'kg' }, volume: { key: 'volume', color: 'var(--gray-700)', label: 'Volume', unit: 'kg' } };
  const m = metricMap[metric];

  return (
    <div style={{ height: '100%', background: 'var(--surface-page)', overflowY: 'auto' }}>
      {/* header */}
      <header style={{ position: 'sticky', top: 0, zIndex: 20, display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', background: 'rgba(247,248,250,0.92)', backdropFilter: 'blur(8px)', borderBottom: '1px solid var(--border-subtle)' }}>
        <IconButton ariaLabel="Back" variant="ghost" onClick={() => nav.go('today')}><Icon name="ArrowLeft" size={20} /></IconButton>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--text-primary)' }}>{d.name}</div>
          <div className="sd-eyebrow" style={{ marginTop: 1 }}>{d.muscles}</div>
        </div>
        <IconButton ariaLabel="Edit exercise" variant="ghost"><Icon name="Pencil" size={18} /></IconButton>
      </header>

      <main style={{ padding: '16px 16px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <StatCard tone="gold" icon={<Icon name="Trophy" size={16} />} label="Best" value={`${d.best.value} kg`} sub={d.best.date} />
          <StatCard icon={<Icon name="TrendingUp" size={16} />} label="Strength change" value={`+${d.trend}%`} sub="vs last 3 sessions" trend="up" />
        </div>

        {/* chart */}
        <Card pad="md" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
            <span style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--text-primary)' }}>Progress</span>
            <SegmentedControl size="sm" fill={false} accent={m.color}
              options={[{ value: 'weight', label: 'Weight' }, { value: 'oneRm', label: '1RM' }, { value: 'volume', label: 'Volume' }]}
              value={metric} onChange={setMetric} />
          </div>
          <AreaChart data={d.chart[m.key]} labels={d.chart.labels} color={m.color} height={190} />
          <SegmentedControl size="sm"
            options={[{ value: '1w', label: '1W' }, { value: '1m', label: '1M' }, { value: '1y', label: '1Y' }, { value: 'all', label: 'All' }]}
            value={range} onChange={setRange} />
        </Card>

        {/* logbook */}
        <div>
          <div className="sd-eyebrow" style={{ marginBottom: 10, paddingLeft: 2 }}>History</div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {d.history.map((h, i) => {
              const maxW = Math.max(...h.sets.map((s) => s.w));
              return (
                <button key={i} onClick={() => nav.go('today')} style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '12px 8px', border: 'none', borderBottom: '1px solid var(--border-subtle)', background: 'none', cursor: 'pointer', textAlign: 'left' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-secondary)' }}>{h.date}</span>
                    <div style={{ flex: 1, height: 1, background: 'var(--border-subtle)' }} />
                    <span className="sd-tnum" style={{ fontSize: 'var(--text-2xs)', color: 'var(--text-tertiary)' }}>Vol {h.volume.toLocaleString()} kg</span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {h.sets.map((s, j) => (
                      <SetChip key={j} reps={s.r} weight={s.w} pr={s.w === maxW ? (s.pr || 'none') : 'none'} trophy={s.pr ? <Icon name="Trophy" size={11} /> : null} />
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}

// ========================= PROFILE =========================
function ProfileScreen({ nav }) {
  const { Card, Avatar, Button, Badge } = DS3;
  const [pwOpen, setPwOpen] = React.useState(false);
  return (
    <div style={{ height: '100%', background: 'var(--surface-page)', overflowY: 'auto' }}>
      <window.TopBar title="Profile" onBack={() => nav.go('today')} />
      <main style={{ padding: '16px 16px 40px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card pad="lg" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <Avatar name={USER.name} size={56} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 'var(--text-lg)', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-.01em' }}>{USER.name}</div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>{USER.email}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 6 }}>
              <Icon name="ShieldCheck" size={13} style={{ color: 'var(--green-500)' }} />
              <span style={{ fontSize: 'var(--text-2xs)', color: 'var(--text-tertiary)' }}>Your data is backed up in the cloud</span>
            </div>
          </div>
        </Card>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 1, borderRadius: 'var(--radius-2xl)', overflow: 'hidden', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)' }}>
          <SettingRow icon="Sparkles" label="Year in Review" sub="Your 2026 training, wrapped" accent />
          <SettingRow icon="Lock" label="Security & Password" sub="Change your password" onClick={() => setPwOpen((o) => !o)} chevronOpen={pwOpen} />
          {pwOpen && (
            <div style={{ padding: '0 16px 16px', background: 'var(--surface-card)', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <DS3.Input type="password" icon={<Icon name="Lock" size={18} />} placeholder="New password (min 6 chars)" />
              <Button variant="primary" size="md" style={{ alignSelf: 'flex-start' }}>Update password</Button>
            </div>
          )}
          <SettingRow icon="Download" label="Export data" sub="Download all data as JSON" />
          <SettingRow icon="Upload" label="Import data" sub="Restore from a backup file" />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Button variant="secondary" fullWidth size="lg" icon={<Icon name="LogOut" size={18} />} onClick={() => nav.go('login')}>Log out</Button>
          <Button variant="danger" fullWidth size="lg" icon={<Icon name="Trash2" size={18} />}>Delete account</Button>
        </div>
      </main>
    </div>
  );
}

function SettingRow({ icon, label, sub, accent, onClick, chevronOpen }) {
  return (
    <button onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '14px 16px', border: 'none', background: 'var(--surface-card)', cursor: 'pointer', textAlign: 'left' }}>
      <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 38, height: 38, borderRadius: 'var(--radius-md)', background: accent ? 'var(--accent-tint)' : 'var(--surface-sunken)', color: accent ? 'var(--accent-hover)' : 'var(--text-secondary)', flexShrink: 0 }}>
        <Icon name={icon} size={18} />
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--text-primary)' }}>{label}</div>
        <div style={{ fontSize: 'var(--text-2xs)', color: 'var(--text-tertiary)' }}>{sub}</div>
      </div>
      <Icon name={chevronOpen ? 'ChevronUp' : 'ChevronRight'} size={18} style={{ color: 'var(--text-tertiary)' }} />
    </button>
  );
}

Object.assign(window, { ExerciseDetailScreen, ProfileScreen });
