/* Loading skeletons + Empty states + PR confetti celebration states */
const DS_ST = window.StrengthDataDesignSystem_5c629b;

// Inline fallbacks in case the bundle hasn't recompiled yet
const Skeleton = DS_ST.Skeleton || function(p) {
  return <div className="sd-shimmer" style={{ width: p.width || '100%', height: p.height || 14, borderRadius: p.radius || 6, flexShrink: 0, ...p.style }} />;
};
const SkeletonGroup = DS_ST.SkeletonGroup || function({ lines = 3, gap = 10, lastWidth = '70%', style = {} }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap, ...style }}>
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton key={i} width={i === lines - 1 ? lastWidth : '100%'} height={13} />
      ))}
    </div>
  );
};
const EmptyState = DS_ST.EmptyState || function({ icon, title, subtitle, action, style = {} }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 6, padding: '36px 24px', ...style }}>
      {icon && <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 60, height: 60, borderRadius: 16, background: 'var(--surface-sunken)', color: 'var(--text-tertiary)', marginBottom: 6 }}>{icon}</span>}
      <strong style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--text-primary)' }}>{title}</strong>
      {subtitle && <p style={{ margin: 0, maxWidth: 280, fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{subtitle}</p>}
      {action && <div style={{ marginTop: 12 }}>{action}</div>}
    </div>
  );
};

function StatesScreen({ nav }) {
  const [state, setState] = React.useState('loading-today');
  const OPTIONS = [
    ['loading-today', 'Today — loading'],
    ['empty-today', 'Today — no workout'],
    ['loading-exercises', 'Exercises — loading'],
    ['empty-exercises', 'Exercises — no results'],
    ['loading-detail', 'Detail — loading'],
    ['empty-detail', 'Detail — no history'],
    ['pr-new', 'PR — new record'],
    ['pr-tied', 'PR — tied record'],
  ];

  return (
    <div style={{ height:'100%',background:'var(--surface-page)',display:'flex',flexDirection:'column',overflow:'hidden' }}>
      <TopBar2 title="States" onBack={() => nav.go('today')} />
      {/* state picker */}
      <div className="sd-no-scrollbar" style={{ overflowX:'auto',borderBottom:'1px solid var(--border-subtle)',padding:'10px 12px',background:'var(--surface-card)',display:'flex',gap:6,flexShrink:0 }}>
        {OPTIONS.map(([k,l]) => (
          <button key={k} onClick={() => setState(k)} style={{ flexShrink:0,height:30,padding:'0 12px',borderRadius:'var(--radius-full)',border:`1px solid ${state===k?'var(--accent)':'var(--border-subtle)'}`,background:state===k?'var(--accent)':'transparent',color:state===k?'#fff':'var(--text-secondary)',fontFamily:'var(--font-sans)',fontSize:'var(--text-xs)',fontWeight:700,cursor:'pointer',whiteSpace:'nowrap' }}>{l}</button>
        ))}
      </div>
      <div className="sd-no-scrollbar" style={{ flex:1,overflowY:'auto' }}>
        {state === 'loading-today' && <LoadingToday />}
        {state === 'empty-today' && <EmptyToday nav={nav} />}
        {state === 'loading-exercises' && <LoadingExercises />}
        {state === 'empty-exercises' && <EmptyExercises />}
        {state === 'loading-detail' && <LoadingDetail />}
        {state === 'empty-detail' && <EmptyDetail />}
        {state === 'pr-new' && <PRCelebration pr="new" />}
        {state === 'pr-tied' && <PRCelebration pr="tied" />}
      </div>
    </div>
  );
}

// ---- Loading: Today ----
function LoadingToday() {
  const { Skeleton, SkeletonGroup } = DS_ST;
  return (
    <div style={{ padding:'16px 16px 32px',display:'flex',flexDirection:'column',gap:14 }}>
      <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center' }}>
        <Skeleton variant="title" width={120} />
        <Skeleton variant="chip" width={80} />
      </div>
      <div style={{ display:'flex',gap:8 }}>
        {Array.from({length:7},(_,i)=><Skeleton key={i} variant="block" height={72} style={{flex:1,borderRadius:'var(--radius-lg)'}} />)}
      </div>
      <div style={{ background:'var(--surface-card)',border:'1px solid var(--border-subtle)',borderRadius:'var(--radius-2xl)',padding:20,display:'flex',flexDirection:'column',gap:14 }}>
        <div style={{ display:'flex',gap:8 }}><Skeleton variant="chip" width={70} /><Skeleton variant="chip" width={56} /></div>
        {Array.from({length:4},(_,i)=>(
          <div key={i} style={{ display:'flex',alignItems:'center',gap:12,padding:'10px',border:'1px solid var(--border-subtle)',borderRadius:'var(--radius-lg)' }}>
            <div style={{ flex:1 }}><SkeletonGroup lines={2} gap={6} lastWidth="55%" /></div>
            <div style={{ display:'flex',gap:6 }}>{Array.from({length:3},(_,j)=><Skeleton key={j} variant="chip" width={54} />)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---- Empty: Today ----
function EmptyToday({ nav }) {
  const { Button, BottomNav } = DS_ST;
  return (
    <div style={{ position:'relative',height:'100%',display:'flex',flexDirection:'column' }}>
      <div style={{ flex:1,display:'flex',alignItems:'center',justifyContent:'center' }}>
        <EmptyState tone="accent" icon={<LIcon name="Dumbbell" size={28} />}
          title="No workout logged for this day"
          subtitle="Add your first exercise to get started."
          action={<Button variant="primary" icon={<LIcon name="Plus" size={18} />} onClick={() => nav.go('today')}>Add manually</Button>} />
      </div>
      <div style={{ padding:'0 16px 20px' }}>
        <BottomNav activeKey="today" items={[{key:'today',label:'Today',icon:<LIcon name="CalendarDays" size={20}/>},{key:'exercises',label:'Exercises',icon:<LIcon name="ListChecks" size={20}/>}]}
          primary={{ label:'Add Exercise', icon:<LIcon name="Plus" size={22}/> }} />
      </div>
    </div>
  );
}

// ---- Loading: Exercises ----
function LoadingExercises() {
  const { Skeleton, SkeletonGroup } = DS_ST;
  return (
    <div style={{ padding:'14px 16px 32px',display:'flex',flexDirection:'column',gap:10 }}>
      <Skeleton variant="block" height={48} style={{ borderRadius:'var(--radius-md)' }} />
      <div style={{ display:'flex',gap:8 }}>{Array.from({length:5},(_,i)=><Skeleton key={i} variant="chip" width={60+i*8} />)}</div>
      {Array.from({length:7},(_,i)=>(
        <div key={i} style={{ display:'flex',alignItems:'center',gap:12,padding:'14px',background:'var(--surface-card)',border:'1px solid var(--border-subtle)',borderRadius:'var(--radius-lg)' }}>
          <div style={{ flex:1 }}><SkeletonGroup lines={2} gap={6} lastWidth="65%" /></div>
          <Skeleton variant="chip" width={52} />
        </div>
      ))}
    </div>
  );
}

// ---- Empty: Exercises (no search results) ----
function EmptyExercises() {
  return (
    <div style={{ display:'flex',alignItems:'center',justifyContent:'center',padding:'40px 20px' }}>
      <EmptyState icon={<LIcon name="SearchX" size={26} />}
        title="No exercises found"
        subtitle="Try a different search term or add a new exercise." />
    </div>
  );
}

// ---- Loading: Exercise Detail ----
function LoadingDetail() {
  const { Skeleton, SkeletonGroup } = DS_ST;
  return (
    <div style={{ padding:'16px 16px 32px',display:'flex',flexDirection:'column',gap:14 }}>
      <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:12 }}>
        <Skeleton variant="card" height={96} />
        <Skeleton variant="card" height={96} />
      </div>
      <div style={{ background:'var(--surface-card)',border:'1px solid var(--border-subtle)',borderRadius:'var(--radius-2xl)',padding:20,display:'flex',flexDirection:'column',gap:12 }}>
        <div style={{ display:'flex',justifyContent:'space-between' }}>
          <Skeleton variant="title" width={90} />
          <Skeleton variant="chip" width={180} style={{ borderRadius:'var(--radius-md)' }} />
        </div>
        <Skeleton variant="block" height={190} style={{ borderRadius:'var(--radius-lg)' }} />
        <Skeleton variant="chip" width="100%" style={{ height:38,borderRadius:'var(--radius-md)' }} />
      </div>
      <div style={{ display:'flex',flexDirection:'column',gap:2 }}>
        {Array.from({length:5},(_,i)=>(
          <div key={i} style={{ padding:'12px 8px',borderBottom:'1px solid var(--border-subtle)',display:'flex',flexDirection:'column',gap:6 }}>
            <SkeletonGroup lines={1} />
            <div style={{ display:'flex',gap:6 }}>{Array.from({length:3},(_,j)=><Skeleton key={j} variant="chip" width={66} />)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---- Empty: Exercise Detail (no history) ----
function EmptyDetail() {
  return (
    <div style={{ display:'flex',alignItems:'center',justifyContent:'center',padding:'60px 20px' }}>
      <EmptyState tone="accent" icon={<LIcon name="BarChart2" size={26} />}
        title="No history yet"
        subtitle="Log this exercise in a workout and your progress will appear here." />
    </div>
  );
}

// ---- PR Celebration ----
function PRCelebration({ pr }) {
  const { SetChip } = DS_ST || {};
  const isNew = pr === 'new';
  const [bounce, setBounce] = React.useState(false);
  React.useEffect(() => { setTimeout(() => setBounce(true), 50); }, [pr]);

  return (
    <div style={{ display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'40px 20px',gap:24,minHeight:320 }}>
      {/* glow ring */}
      <div style={{ position:'relative',display:'flex',alignItems:'center',justifyContent:'center' }}>
        <div style={{ position:'absolute',width:100,height:100,borderRadius:'50%',background: isNew ? 'var(--gold-tint)' : 'var(--cyan-tint)',boxShadow: isNew ? '0 0 32px rgba(245,158,11,0.35)' : '0 0 32px rgba(6,182,212,0.30)',animation:'sd-fade-in 400ms both' }} />
        <span style={{ position:'relative',display:'inline-flex',fontSize:44,animation: bounce ? 'sd-trophy-bounce 600ms var(--ease-spring) both' : 'none',color: isNew ? 'var(--gold-500)' : 'var(--cyan-500)' }}>
          <LIcon name="Trophy" size={48} />
        </span>
      </div>

      <div style={{ textAlign:'center' }}>
        <div style={{ fontSize:'var(--text-3xl)',fontWeight:800,letterSpacing:'-0.02em',color: isNew?'var(--gold-500)':'var(--cyan-500)',lineHeight:1.1 }}>
          {isNew ? 'New PR!' : 'Tied PR!'}
        </div>
        <p style={{ margin:'8px 0 0',fontSize:'var(--text-sm)',color:'var(--text-secondary)',fontWeight:500 }}>
          {isNew ? 'You just set a new personal record.' : 'You matched your all-time best.'}
        </p>
      </div>

      <div style={{ display:'flex',flexDirection:'column',gap:10,alignItems:'center' }}>
        <div style={{ display:'flex',gap:8,alignItems:'center' }}>
          <SetChip reps={6} weight={100} pr={pr} trophy={<LIcon name="Trophy" size={11} />} />
          <SetChip reps={8} weight={80} />
          <SetChip reps={12} weight={60} />
        </div>
        <span style={{ fontSize:'var(--text-xs)',color:'var(--text-tertiary)',fontWeight:600 }}>
          Bench Press · Mon 15 Jun
        </span>
      </div>

      {isNew && <PRConfetti />}
    </div>
  );
}

function PRConfetti() {
  const pieces = React.useMemo(() => Array.from({length:22},(_,i) => ({
    id:i, x:15+Math.random()*70, size:5+Math.random()*5,
    delay:Math.random()*0.3, dur:1+Math.random()*0.6,
    color:['var(--gold-500)','var(--push-500)','var(--accent)','var(--green-500)','var(--cyan-500)'][i%5],
    rot:Math.random()*360,
  })),[]);
  return (
    <div style={{ position:'fixed',inset:0,pointerEvents:'none',zIndex:1 }}>
      {pieces.map(p=>(
        <div key={p.id} style={{ position:'absolute',top:-12,left:`${p.x}%`,width:p.size,height:p.size,borderRadius:p.size/4,background:p.color,transform:`rotate(${p.rot}deg)`,animation:`sd-confetti-fall ${p.dur}s ${p.delay}s var(--ease-standard) forwards` }} />
      ))}
    </div>
  );
}

Object.assign(window, { StatesScreen });
