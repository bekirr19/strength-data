/* Calendar screen for the Strength Data UI kit */
const DS_CAL = window.StrengthDataDesignSystem_5c629b;

// Sample workout data for June 2026
const JUNE_WORKOUTS = {
  '2026-06-01': 'push', '2026-06-03': 'pull', '2026-06-05': 'leg',
  '2026-06-08': 'push', '2026-06-09': 'leg', '2026-06-10': 'push',
  '2026-06-12': 'pull', '2026-06-14': 'push', '2026-06-15': 'push',
  '2026-06-17': 'pull', '2026-06-19': 'leg', '2026-06-22': 'push',
  '2026-06-23': 'pull', '2026-06-24': 'leg', '2026-06-26': 'push',
};
const WTC = (window.StrengthDataDesignSystem_5c629b && window.StrengthDataDesignSystem_5c629b.WORKOUT_TYPE_COLORS) || {};

function CalendarScreen({ nav }) {
  const today = new Date(2026, 5, 15); // June 15 2026
  const [year, setYear] = React.useState(2026);
  const [month, setMonth] = React.useState(5); // 0-indexed
  const [selected, setSelected] = React.useState('2026-06-15');
  const [animDir, setAnimDir] = React.useState(0); // -1 prev, 1 next

  const goMonth = dir => {
    setAnimDir(dir);
    setMonth(m => { let nm = m + dir; let ny = year; if (nm < 0) { nm = 11; ny--; } if (nm > 11) { nm = 0; ny++; } setYear(ny); return nm; });
  };

  const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
  const startOffset = (firstDay + 6) % 7; // Mon-start
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = Array.from({ length: 42 }, (_, i) => i - startOffset + 1);

  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const dayNames = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

  const iso = (d) => `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
  const todayIso = '2026-06-15';

  return (
    <div style={{ height: '100%', background: 'var(--surface-page)', overflowY: 'auto' }}>
      <TopBar2 title="Calendar" onBack={() => nav.go('today')} />
      <div style={{ padding: '16px 16px 32px' }}>
        {/* month nav */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <DS_CAL.IconButton ariaLabel="Previous month" variant="soft" onClick={() => goMonth(-1)}><LIcon name="ChevronLeft" size={20} /></DS_CAL.IconButton>
          <span style={{ fontSize: 'var(--text-lg)', fontWeight: 800, letterSpacing: '-0.01em', color: 'var(--text-primary)' }}>{monthNames[month]} {year}</span>
          <DS_CAL.IconButton ariaLabel="Next month" variant="soft" onClick={() => goMonth(1)}><LIcon name="ChevronRight" size={20} /></DS_CAL.IconButton>
        </div>

        {/* day headers */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 4 }}>
          {dayNames.map(d => (
            <div key={d} style={{ textAlign: 'center', fontSize: 'var(--text-3xs)', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em', paddingBottom: 6 }}>{d}</div>
          ))}
        </div>

        {/* cells */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
          {cells.map((d, i) => {
            const valid = d >= 1 && d <= daysInMonth;
            if (!valid) return <div key={i} />;
            const key = iso(d);
            const cat = JUNE_WORKOUTS[key] || null;
            const isToday = key === todayIso;
            const isSel = key === selected;
            const c = cat ? (WTC[cat] || {}) : {};
            return (
              <button
                key={i}
                onClick={() => { setSelected(key); nav.go('today'); }}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3,
                  aspectRatio: '1', borderRadius: 'var(--radius-md)', border: `1.5px solid ${isSel ? 'var(--accent)' : isToday ? 'var(--border-strong)' : 'transparent'}`,
                  background: cat ? c.tint : isSel ? 'var(--accent-tint)' : 'var(--surface-card)',
                  cursor: 'pointer', padding: 0,
                  animation: `sd-rise ${180 + i * 14}ms var(--ease-out) both`,
                  boxShadow: isSel ? 'var(--shadow-sm)' : 'none',
                  transition: 'background var(--dur-fast) var(--ease-standard)',
                }}
              >
                <span className="sd-tnum" style={{ fontSize: 'var(--text-sm)', fontWeight: isSel || isToday ? 800 : 500, color: cat ? c.fg : isSel ? 'var(--accent-hover)' : 'var(--text-primary)' }}>{d}</span>
                {cat && <span style={{ width: 5, height: 5, borderRadius: '50%', background: c.dot, flexShrink: 0 }} />}
              </button>
            );
          })}
        </div>

        {/* legend */}
        <div style={{ marginTop: 20, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {[['push','Push'],['pull','Pull'],['leg','Leg'],['other','Other']].map(([k,l]) => {
            const c = WTC[k] || {};
            return (
              <span key={k} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 'var(--text-2xs)', color: c.fg, fontWeight: 700 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: c.dot }} />{l}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { CalendarScreen });
