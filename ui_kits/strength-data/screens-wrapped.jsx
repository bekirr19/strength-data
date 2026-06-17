/* Year in Review / Wrapped screen — animated swipeable summary cards */
const DS_W = window.StrengthDataDesignSystem_5c629b;

// Inline fallback — renders static value until bundle recompiles
const AnimatedNumber = DS_W.AnimatedNumber || function({ value = 0, decimals = 0, prefix = '', suffix = '', format = true }) {
  const n = Number(value).toFixed(decimals);
  const text = format ? Number(n).toLocaleString(undefined, { minimumFractionDigits: decimals }) : n;
  return <span className="sd-tnum">{prefix}{text}{suffix}</span>;
};

const WRAPPED_CARDS = [
  { id: 'intro',     bg: 'var(--accent)', textColor: '#fff' },
  { id: 'workouts',  bg: '#fff', textColor: 'var(--text-primary)' },
  { id: 'volume',    bg: 'var(--leg-tint)', textColor: 'var(--leg-700)' },
  { id: 'favourite', bg: 'var(--push-tint)', textColor: 'var(--push-700)' },
  { id: 'prs',       bg: 'var(--gold-tint)', textColor: 'var(--gold-500)' },
  { id: 'streak',    bg: 'var(--green-tint)', textColor: 'var(--green-500)' },
  { id: 'focus',     bg: 'var(--pull-tint)', textColor: 'var(--pull-700)' },
];

function WrappedScreen({ nav }) {
  const [idx, setIdx] = React.useState(0);
  const [confettiKey, setConfettiKey] = React.useState(0);
  const total = WRAPPED_CARDS.length;

  const go = dir => {
    const next = idx + dir;
    if (next < 0 || next >= total) return;
    setIdx(next);
    if (next === 0) setConfettiKey(k => k + 1);
  };

  React.useEffect(() => { setConfettiKey(k => k + 1); }, []);

  return (
    <div style={{ height:'100%',background:'var(--surface-page)',display:'flex',flexDirection:'column' }}>
      <header style={{ display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 16px',borderBottom:'1px solid var(--border-subtle)',background:'var(--surface-card)' }}>
        <DS_W.IconButton ariaLabel="Close" variant="ghost" onClick={() => nav.go('profile')}><LIcon name="X" size={20} /></DS_W.IconButton>
        <span style={{ fontSize:'var(--text-xs)',fontWeight:700,color:'var(--text-secondary)' }}>{idx+1} / {total}</span>
        <DS_W.Button variant="ghost" size="sm" onClick={() => nav.go('profile')}>Done</DS_W.Button>
      </header>

      {/* progress bar */}
      <div style={{ display:'flex',gap:4,padding:'8px 16px',background:'var(--surface-card)',borderBottom:'1px solid var(--border-subtle)' }}>
        {WRAPPED_CARDS.map((_,i) => (
          <div key={i} style={{ flex:1,height:3,borderRadius:2,background: i <= idx ? 'var(--accent)' : 'var(--gray-200)', transition:'background var(--dur-base) var(--ease-standard)' }} />
        ))}
      </div>

      {/* card */}
      <div style={{ flex:1,padding:'16px',display:'flex',flexDirection:'column' }}>
        <WrappedCard card={WRAPPED_CARDS[idx]} idx={idx} confettiKey={confettiKey} />
      </div>

      {/* nav buttons */}
      <div style={{ display:'flex',gap:12,padding:'12px 16px 20px' }}>
        {idx > 0 && <DS_W.Button variant="secondary" fullWidth onClick={() => go(-1)} icon={<LIcon name="ArrowLeft" size={16} />}>Back</DS_W.Button>}
        {idx < total-1
          ? <DS_W.Button variant="primary" fullWidth onClick={() => go(1)} trailingIcon={<LIcon name="ArrowRight" size={16} />}>Next</DS_W.Button>
          : <DS_W.Button variant="primary" fullWidth onClick={() => nav.go('profile')} icon={<LIcon name="Check" size={16} />}>Finish</DS_W.Button>
        }
      </div>
    </div>
  );
}

function WrappedCard({ card, idx, confettiKey }) {
  const { AnimatedNumber } = DS_W;
  const isIntro = card.id === 'intro';
  const bg = card.bg;
  const fg = card.textColor;

  const content = {
    intro: {
      eyebrow: '2026 wrapped',
      title: 'Your year in lifting',
      sub: 'Tap through to see your training story — every rep, every kilo, every PR.',
      icon: 'Dumbbell',
    },
    workouts: { eyebrow: 'Total workouts', value: 137, suffix: '', unit: 'sessions', icon: 'CalendarCheck', caption: 'You trained on avg 2.7× per week.' },
    volume: { eyebrow: 'Total volume moved', value: 284310, suffix: ' kg', decimals: 0, icon: 'Weight', caption: 'That\'s roughly 4 jumbo jets.' },
    favourite: { eyebrow: 'Favourite exercise', textValue: 'Bench Press', sub: '117 sessions · Push', icon: 'Heart' },
    prs: { eyebrow: 'Personal records smashed', value: 34, icon: 'Trophy', caption: '34 new lifetime bests set.' },
    streak: { eyebrow: 'Longest streak', value: 12, unit: 'days in a row', icon: 'Flame', caption: 'June 1–12 · Your best run yet.' },
    focus: { eyebrow: 'Most-trained focus', textValue: 'Push', sub: '61 sessions (45 %)', icon: 'Zap' },
  };

  const c = content[card.id] || {};

  return (
    <div key={card.id} style={{ flex:1,borderRadius:'var(--radius-2xl)',background:bg,border:'1px solid var(--border-subtle)',boxShadow:'var(--shadow-lg)',padding:'28px 24px',display:'flex',flexDirection:'column',justifyContent:'center',alignItems:'center',textAlign:'center',position:'relative',overflow:'hidden',animation:'sd-pop-in 300ms var(--ease-spring) both' }}>
      {/* confetti on first card */}
      {isIntro && <Confetti key={confettiKey} />}

      <span style={{ display:'inline-flex',alignItems:'center',justifyContent:'center',width:72,height:72,borderRadius:'var(--radius-xl)',background:'rgba(255,255,255,0.22)',marginBottom:18,color:fg }}>
        <LIcon name={c.icon || 'Star'} size={34} />
      </span>
      <div style={{ fontSize:'var(--text-2xs)',fontWeight:800,textTransform:'uppercase',letterSpacing:'0.12em',color:fg,opacity:0.75,marginBottom:8 }}>{c.eyebrow}</div>
      {c.value != null && (
        <div style={{ fontSize:'var(--text-4xl)',fontWeight:800,letterSpacing:'-0.02em',color:fg,lineHeight:1.05 }}>
          <AnimatedNumber value={c.value} decimals={c.decimals || 0} suffix={c.suffix || ''} duration={900} />
        </div>
      )}
      {c.unit && <div style={{ fontSize:'var(--text-base)',fontWeight:600,color:fg,opacity:0.8,marginTop:4 }}>{c.unit}</div>}
      {c.textValue && <div style={{ fontSize:'var(--text-3xl)',fontWeight:800,letterSpacing:'-0.02em',color:fg,lineHeight:1.1,marginTop:4 }}>{c.textValue}</div>}
      {c.sub && <div style={{ fontSize:'var(--text-sm)',color:fg,opacity:0.75,marginTop:8,fontWeight:600 }}>{c.sub}</div>}
      {c.title && <div style={{ fontSize:'var(--text-2xl)',fontWeight:800,letterSpacing:'-0.01em',color:fg,marginTop:6 }}>{c.title}</div>}
      {(c.caption || c.sub && !c.textValue) && <div style={{ marginTop:14,fontSize:'var(--text-xs)',color:fg,opacity:0.7,maxWidth:260,lineHeight:1.5 }}>{c.caption || c.sub}</div>}
    </div>
  );
}

function Confetti() {
  const pieces = React.useMemo(() => Array.from({length:28},(_,i) => ({
    id: i,
    x: 10 + Math.random()*80,
    size: 6 + Math.random()*6,
    delay: Math.random()*0.5,
    dur: 1.1 + Math.random()*0.7,
    color: ['var(--gold-500)','var(--accent)','var(--green-500)','var(--push-500)','var(--cyan-500)','var(--leg-500)'][i%6],
    rot: Math.random()*360,
  })),[]);
  return (
    <div style={{ position:'absolute',inset:0,pointerEvents:'none',overflow:'hidden' }}>
      {pieces.map(p => (
        <div key={p.id} style={{ position:'absolute',top:-16,left:`${p.x}%`,width:p.size,height:p.size,borderRadius:p.size/4,background:p.color,transform:`rotate(${p.rot}deg)`,animation:`sd-confetti-fall ${p.dur}s ${p.delay}s var(--ease-standard) both` }} />
      ))}
    </div>
  );
}

Object.assign(window, { WrappedScreen });
