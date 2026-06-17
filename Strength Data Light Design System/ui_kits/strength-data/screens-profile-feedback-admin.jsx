/* Profile (complete) + Feedback + Admin screens for the Strength Data UI kit */
const DS_P = window.StrengthDataDesignSystem_5c629b;

const _useToasts = DS_P.useToasts || function() {
  const [toasts, setToasts] = React.useState([]);
  const push = React.useCallback((t) => {
    const id = Math.random().toString(36).slice(2);
    setToasts(p => [...p, { ...t, id }]);
    const dur = t.duration !== 0 ? (t.duration || 2600) : 0;
    if (dur > 0) setTimeout(() => setToasts(p => p.filter(x => x.id !== id)), dur);
    return id;
  }, []);
  const dismiss = React.useCallback(id => setToasts(p => p.filter(x => x.id !== id)), []);
  const ToastDock = React.useCallback(({ renderIcon }) => (
    <div style={{ position: 'absolute', top: 12, left: 12, right: 12, zIndex: 80, display: 'flex', flexDirection: 'column', gap: 8, pointerEvents: 'none' }}>
      {toasts.map(t => (
        <div key={t.id} style={{ pointerEvents: 'auto', display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', borderLeft: `3px solid ${t.tone === 'success' ? 'var(--green-500)' : t.tone === 'error' ? 'var(--red-500)' : 'var(--accent)'}`, borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)', animation: 'sd-toast-in var(--dur-slow) var(--ease-out)' }}>
          {renderIcon && <span style={{ display: 'inline-flex' }}>{renderIcon(t)}</span>}
          <div style={{ flex: 1, minWidth: 0 }}>
            {t.title && <div style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--text-primary)' }}>{t.title}</div>}
            {t.message && <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>{t.message}</div>}
          </div>
          <button onClick={() => dismiss(t.id)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', fontSize: 18, lineHeight: 1, padding: 2 }}>×</button>
        </div>
      ))}
    </div>
  ), [toasts, dismiss]);
  return { toasts, push, dismiss, ToastDock };
};

const _EmptyState = DS_P.EmptyState || function({ icon, title, subtitle, action, style = {} }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 6, padding: '36px 24px', ...style }}>
      {icon && <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 60, height: 60, borderRadius: 16, background: 'var(--accent-tint)', color: 'var(--accent-hover)', marginBottom: 6 }}>{icon}</span>}
      <strong style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--text-primary)' }}>{title}</strong>
      {subtitle && <p style={{ margin: 0, maxWidth: 280, fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{subtitle}</p>}
      {action && <div style={{ marginTop: 12 }}>{action}</div>}
    </div>
  );
};

// ===================== PROFILE COMPLETE =====================
function ProfileCompleteScreen({ nav }) {
  const { Card, Avatar, Button, Input } = DS_P;
  const { push, ToastDock } = _useToasts();
  const [pwOpen, setPwOpen] = React.useState(false);
  const [pw, setPw] = React.useState('');
  const [importOpen, setImportOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [reauth, setReauth] = React.useState(false);

  const I = (name, sz = 18) => <LIcon name={name} size={sz} />;

  return (
    <div style={{ height: '100%', background: 'var(--surface-page)', overflowY: 'auto', position: 'relative' }}>
      <ToastDock renderIcon={t => I(t.tone === 'success' ? 'CircleCheck' : t.tone === 'error' ? 'CircleAlert' : 'Info', 16)} />
      <TopBar2 title="Profile" onBack={() => nav.go('today')} />
      <main style={{ padding: '16px 16px 40px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, background: 'var(--surface-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-2xl)', padding: 18, boxShadow: 'var(--shadow-sm)' }}>
          <Avatar name={USER.name} size={56} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 'var(--text-lg)', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>{USER.name}</div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>{USER.email}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 6 }}>
              <LIcon name="ShieldCheck" size={13} style={{ color: 'var(--green-500)' }} />
              <span style={{ fontSize: 'var(--text-2xs)', color: 'var(--text-tertiary)' }}>Your data is backed up in the cloud</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 1, borderRadius: 'var(--radius-2xl)', overflow: 'hidden', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)' }}>
          <PRow icon="Sparkles" label="Year in Review" sub="Your 2026 training, wrapped" accent onClick={() => nav.go('wrapped')} />
          <PRow icon="Lock" label="Security & Password" sub="Change your password" chevronOpen={pwOpen} onClick={() => setPwOpen(o => !o)} />
          {pwOpen && (
            <div style={{ padding: '4px 16px 16px', background: 'var(--surface-card)', display: 'flex', flexDirection: 'column', gap: 10, borderBottom: '1px solid var(--border-subtle)' }}>
              <Input type="password" icon={I('Lock')} placeholder="New password (min 6 chars)" value={pw} onChange={e => setPw(e.target.value)} />
              <Button variant="primary" size="sm" style={{ alignSelf: 'flex-start' }} onClick={() => {
                if (pw.length < 6) { push({ tone:'error', title:'Too short', message:'Password must be at least 6 characters.' }); return; }
                setPw(''); setPwOpen(false);
                push({ tone:'success', title:'Password updated', message:'Your new password is saved.' });
              }}>Update password</Button>
            </div>
          )}
          <PRow icon="Download" label="Export data" sub="Download all data as JSON" onClick={() => push({ tone:'success', title:'Export ready', message:'workout_data.json downloaded.' })} />
          <PRow icon="Upload" label="Import data" sub="Restore from a backup JSON" onClick={() => setImportOpen(true)} />
          <PRow icon="Trash2" label="Delete account" sub="Permanently delete all data" danger onClick={() => setDeleteOpen(true)} />
        </div>

        <Button variant="secondary" fullWidth size="lg" icon={I('LogOut')} onClick={() => nav.go('login')}>Log out</Button>
      </main>

      {importOpen && (
        <ImportModal onClose={() => setImportOpen(false)} onConfirm={() => { setImportOpen(false); push({ tone:'success', title:'Imported', message:'137 workouts restored.' }); }} />
      )}

      {deleteOpen && (
        <DeleteAccountModal reauth={reauth} onReauth={() => setReauth(true)}
          onExport={() => push({ tone:'success', title:'Export ready', message:'Backup saved before deletion.' })}
          onClose={() => { setDeleteOpen(false); setReauth(false); }}
          onConfirm={() => { setDeleteOpen(false); nav.go('login'); }} />
      )}
    </div>
  );
}

function PRow({ icon, label, sub, accent, danger, onClick, chevronOpen }) {
  return (
    <button onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '14px 16px', border: 'none', background: 'var(--surface-card)', cursor: 'pointer', textAlign: 'left', borderBottom: '1px solid var(--border-subtle)' }}>
      <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: 'var(--radius-md)', background: danger ? 'var(--red-tint)' : accent ? 'var(--accent-tint)' : 'var(--surface-sunken)', color: danger ? 'var(--red-600)' : accent ? 'var(--accent-hover)' : 'var(--text-secondary)', flexShrink: 0 }}>
        <LIcon name={icon} size={18} />
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: danger ? 'var(--red-600)' : 'var(--text-primary)' }}>{label}</div>
        <div style={{ fontSize: 'var(--text-2xs)', color: 'var(--text-tertiary)' }}>{sub}</div>
      </div>
      <LIcon name={chevronOpen ? 'ChevronUp' : 'ChevronRight'} size={18} style={{ color: 'var(--text-tertiary)' }} />
    </button>
  );
}

function ImportModal({ onClose, onConfirm }) {
  const [stage, setStage] = React.useState('pick');
  return (
    <div style={{ position:'absolute',inset:0,zIndex:60,display:'flex',alignItems:'center',justifyContent:'center',padding:20 }}>
      <div onClick={onClose} style={{ position:'absolute',inset:0,background:'rgba(31,41,55,0.34)' }} />
      <div style={{ position:'relative',width:'100%',maxWidth:360,background:'var(--surface-card)',borderRadius:'var(--radius-2xl)',boxShadow:'var(--shadow-xl)',padding:'22px 20px 20px',animation:'sd-pop-in var(--dur-slow) var(--ease-spring)' }}>
        <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:16 }}>
          <h3 style={{ margin:0,fontSize:'var(--text-xl)',fontWeight:800,color:'var(--text-primary)' }}>Import data</h3>
          <DS_P.IconButton ariaLabel="Close" variant="soft" onClick={onClose}><LIcon name="X" size={18} /></DS_P.IconButton>
        </div>
        {stage === 'pick' ? (
          <>
            <p style={{ margin:'0 0 16px',fontSize:'var(--text-sm)',color:'var(--text-secondary)' }}>Select a <strong>workout_data.json</strong> backup file to restore.</p>
            <DS_P.Button variant="secondary" fullWidth size="lg" icon={<LIcon name="FolderOpen" size={18} />} onClick={() => setStage('preview')}>Select file…</DS_P.Button>
          </>
        ) : (
          <>
            <div style={{ background:'var(--surface-sunken)',borderRadius:'var(--radius-md)',padding:'12px 14px',marginBottom:16,fontSize:'var(--text-sm)',color:'var(--text-secondary)' }}>
              <strong style={{ color:'var(--text-primary)' }}>workout_data.json</strong><br/>
              137 workouts · 2 024 exercise records · 1 bodyweight log
            </div>
            <p style={{ margin:'0 0 16px',fontSize:'var(--text-xs)',color:'var(--text-tertiary)' }}>This will merge the imported data with your current data.</p>
            <div style={{ display:'flex',gap:10 }}>
              <DS_P.Button variant="secondary" fullWidth onClick={() => setStage('pick')}>Back</DS_P.Button>
              <DS_P.Button variant="primary" fullWidth onClick={onConfirm}>Confirm import</DS_P.Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function DeleteAccountModal({ reauth, onReauth, onExport, onClose, onConfirm }) {
  return (
    <div style={{ position:'absolute',inset:0,zIndex:60,display:'flex',alignItems:'center',justifyContent:'center',padding:20 }}>
      <div onClick={onClose} style={{ position:'absolute',inset:0,background:'rgba(31,41,55,0.34)' }} />
      <div style={{ position:'relative',width:'100%',maxWidth:360,background:'var(--surface-card)',borderRadius:'var(--radius-2xl)',boxShadow:'var(--shadow-xl)',padding:'22px 20px 20px',animation:'sd-pop-in var(--dur-slow) var(--ease-spring)' }}>
        <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:14 }}>
          <h3 style={{ margin:0,fontSize:'var(--text-xl)',fontWeight:800,color:'var(--red-600)' }}>Delete account</h3>
          <DS_P.IconButton ariaLabel="Close" variant="soft" onClick={onClose}><LIcon name="X" size={18} /></DS_P.IconButton>
        </div>
        {reauth ? (
          <>
            <p style={{ margin:'0 0 14px',fontSize:'var(--text-sm)',color:'var(--text-secondary)' }}>Firebase requires a recent login before deleting your account. Log out and sign in again to continue.</p>
            <div style={{ display:'flex',flexDirection:'column',gap:10 }}>
              <DS_P.Button variant="secondary" fullWidth onClick={onClose}>Cancel</DS_P.Button>
              <DS_P.Button variant="danger" fullWidth icon={<LIcon name="LogOut" size={16} />} onClick={onConfirm}>Log out &amp; retry</DS_P.Button>
            </div>
          </>
        ) : (
          <>
            <div style={{ background:'var(--red-tint)',borderRadius:'var(--radius-md)',padding:'10px 14px',marginBottom:14,fontSize:'var(--text-xs)',color:'var(--red-600)',fontWeight:600 }}>
              This will permanently delete all your workouts, exercise history, and account. This cannot be undone.
            </div>
            <p style={{ margin:'0 0 16px',fontSize:'var(--text-sm)',color:'var(--text-secondary)' }}>We recommend exporting a backup first.</p>
            <div style={{ display:'flex',flexDirection:'column',gap:10 }}>
              <DS_P.Button variant="secondary" fullWidth icon={<LIcon name="Download" size={16} />} onClick={onExport}>Export backup first</DS_P.Button>
              <DS_P.Button variant="danger" fullWidth onClick={onReauth}>Delete my account</DS_P.Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ===================== FEEDBACK SCREEN =====================
function FeedbackScreen({ nav }) {
  const { Input, Button, SegmentedControl } = DS_P;
  const { push, ToastDock } = _useToasts();
  const [cat, setCat] = React.useState('idea');
  const [msg, setMsg] = React.useState('');
  const [done, setDone] = React.useState(false);

  return (
    <div style={{ height:'100%',background:'var(--surface-page)',overflowY:'auto',position:'relative' }}>
      <ToastDock renderIcon={t => <LIcon name="CircleCheck" size={16} />} />
      <TopBar2 title="Feedback" onBack={() => nav.go('today')} />
      <main style={{ padding:'20px 16px 40px' }}>
        {done ? (
          <_EmptyState tone="accent" icon={<LIcon name="CircleCheck" size={28} />}
            title="Thanks for your feedback!" subtitle="We read every message and use it to improve the app." />
        ) : (
          <div style={{ display:'flex',flexDirection:'column',gap:16 }}>
            <p style={{ margin:0,fontSize:'var(--text-sm)',color:'var(--text-secondary)',fontWeight:500 }}>
              Found a bug, have an idea, or just want to say hi? We'd love to hear from you.
            </p>
            <div>
              <div className="sd-eyebrow" style={{ marginBottom:8 }}>Category</div>
              <SegmentedControl options={[{value:'bug',label:'Bug'},{value:'idea',label:'Idea'},{value:'other',label:'Other'}]} value={cat} onChange={setCat} />
            </div>
            <div>
              <div className="sd-eyebrow" style={{ marginBottom:8 }}>Message</div>
              <textarea value={msg} onChange={e => setMsg(e.target.value)} placeholder={cat==='bug' ? 'Describe the bug…' : cat==='idea' ? 'What would you like to see?' : 'Your message…'} rows={5}
                style={{ width:'100%',resize:'vertical',padding:'12px 14px',borderRadius:'var(--radius-md)',border:'1px solid var(--border-subtle)',background:'var(--surface-card)',fontFamily:'var(--font-sans)',fontSize:'var(--text-sm)',color:'var(--text-primary)',boxShadow:'var(--shadow-xs)',outline:'none',boxSizing:'border-box' }} />
            </div>
            <Button variant="primary" fullWidth size="lg" icon={<LIcon name="Send" size={18} />}
              onClick={() => { if (!msg.trim()) { push({tone:'error',title:'Empty message',message:'Write something before sending.'}); return; } setDone(true); }}>
              Send feedback
            </Button>
            <div style={{ marginTop:8 }}>
              <div className="sd-eyebrow" style={{ marginBottom:10 }}>What's new in v2.0</div>
              {[
                ['Zap','Light theme','Complete redesign with a clean, light visual language.'],
                ['BarChart2','Improved charts','Smoother area charts with period-max reference lines.'],
                ['Tag','Workout types','Upper, Leg+Push, Full Body combos with their own tints.'],
                ['Dumbbell','BW notation','Bodyweight sets (BW / BW+5) in steppers and chips.'],
              ].map(([ic,t,s]) => (
                <div key={t} style={{ display:'flex',gap:12,padding:'12px 0',borderBottom:'1px solid var(--border-subtle)' }}>
                  <span style={{ display:'inline-flex',width:34,height:34,flexShrink:0,alignItems:'center',justifyContent:'center',borderRadius:'var(--radius-sm)',background:'var(--accent-tint)',color:'var(--accent)' }}><LIcon name={ic} size={18} /></span>
                  <div><div style={{ fontSize:'var(--text-sm)',fontWeight:700,color:'var(--text-primary)' }}>{t}</div><div style={{ fontSize:'var(--text-xs)',color:'var(--text-secondary)',marginTop:2 }}>{s}</div></div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// ======================== ADMIN PANEL ========================
function AdminScreen({ nav }) {
  const { StatCard, Avatar, Badge } = DS_P;
  const stats = [
    { label:'Total users', value:'1,284', icon:'Users', trend: null },
    { label:'Total workouts', value:'48,392', icon:'Dumbbell', trend: 'up' },
    { label:'Active today', value:'212', icon:'Activity', trend: 'up' },
    { label:'New this week', value:'37', icon:'UserPlus', trend: null },
  ];
  const users = [
    { name:'Ahmet Yılmaz', email:'ahmet@example.com', workouts:137, last:'Today', active:true },
    { name:'Sara Kaya', email:'sara@example.com', workouts:84, last:'Yesterday', active:true },
    { name:'James Hill', email:'james@example.com', workouts:52, last:'3 Jun', active:false },
    { name:'Lena Müller', email:'lena@example.com', workouts:29, last:'28 May', active:false },
    { name:'Chloe Martin', email:'chloe@example.com', workouts:15, last:'10 May', active:false },
  ];

  return (
    <div style={{ height:'100%',background:'var(--surface-page)',overflowY:'auto' }}>
      <TopBar2 title="Admin" onBack={() => nav.go('today')} />
      <main style={{ padding:'16px 16px 40px',display:'flex',flexDirection:'column',gap:16 }}>
        <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:10 }}>
          {stats.map(s => (
            <StatCard key={s.label} icon={<LIcon name={s.icon} size={16} />} label={s.label} value={s.value} trend={s.trend} />
          ))}
        </div>
        <div>
          <div className="sd-eyebrow" style={{ marginBottom:10,paddingLeft:2 }}>Users</div>
          <div style={{ background:'var(--surface-card)',border:'1px solid var(--border-subtle)',borderRadius:'var(--radius-2xl)',overflow:'hidden',boxShadow:'var(--shadow-sm)' }}>
            {users.map((u,i) => (
              <div key={u.email} style={{ display:'flex',alignItems:'center',gap:12,padding:'13px 16px',borderBottom: i < users.length-1 ? '1px solid var(--border-subtle)' : 'none' }}>
                <Avatar name={u.name} size={36} />
                <div style={{ flex:1,minWidth:0 }}>
                  <div style={{ fontSize:'var(--text-sm)',fontWeight:700,color:'var(--text-primary)',display:'flex',alignItems:'center',gap:6 }}>
                    {u.name}
                    {u.active && <Badge tone="green" solid style={{ fontSize:'0.5rem', height:16 }}>Active</Badge>}
                  </div>
                  <div style={{ fontSize:'var(--text-2xs)',color:'var(--text-tertiary)' }}>{u.email} · {u.workouts} workouts · Last {u.last}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

Object.assign(window, { ProfileCompleteScreen, FeedbackScreen, AdminScreen });
